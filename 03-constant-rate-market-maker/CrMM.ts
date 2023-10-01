import { FromInventoryExecutor } from "@aori-io/sdk";

export class ConstantRateMarketMaker extends FromInventoryExecutor {
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

    async initialise({ chainId, aTokenAddress, bTokenAddress, aAmount, bAmount, interval = 60 * 60 * 1000 }: { chainId: number, aTokenAddress: string, bTokenAddress: string, aAmount: bigint, bAmount: bigint, interval: number }): Promise<void> {
        super.initialise();
        console.log("Initialised bot");

        this.defaultOrder = {
            inputToken: aTokenAddress,
            outputToken: bTokenAddress,
            inputAmount: aAmount,
            outputAmount: bAmount,
            chainId
        }

        setInterval(async () => {
            await this.refreshOrder();
        }, interval);

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