import { FromInventoryExecutor, SubscriptionEvents } from "@aori-io/sdk";

export class ConstantMarketMaker extends FromInventoryExecutor {

    aTokenAddress: string = "";
    bTokenAddress: string = "";
    chainId: number = 5;

    defaultOrder: {
        inputToken: string,
        outputToken: string,
        inputAmount: bigint,
        outputAmount: bigint,
        chainId: number
    } = undefined as any;

    async initialise({ chainId, aTokenAddress, bTokenAddress, aAmount, bAmount }: { chainId: number, aTokenAddress: string, bTokenAddress: string, aAmount: bigint, bAmount: bigint }): Promise<void> {
        super.initialise();
        console.log("Initialised bot");

        this.defaultOrder = {
            inputToken: aTokenAddress,
            outputToken: bTokenAddress,
            inputAmount: aAmount,
            outputAmount: bAmount,
            chainId
        }

        this.on(SubscriptionEvents.OrderTaken, async (orderHash) => await this.refreshOrder());
        await this.refreshOrder();
    }

    async refreshOrder(): Promise<void> {
        if (!this.defaultOrder) return;

        this.makeOrder({
            order: await this.createLimitOrder(this.defaultOrder),
            chainId: this.defaultOrder.chainId
        });
    }
}