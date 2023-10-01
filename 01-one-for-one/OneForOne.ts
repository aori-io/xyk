import { FromInventoryExecutor, SubscriptionEvents } from "@aori-io/sdk";

export class OneForOneBot extends FromInventoryExecutor {

    aTokenAddress: string = "";
    bTokenAddress: string = "";
    chainId: number = 5;

    async initialise({ chainId, aTokenAddress, bTokenAddress }: { chainId: number, aTokenAddress: string, bTokenAddress: string }): Promise<void> {
        console.log("Initialised bot");
        super.initialise();

        this.chainId = chainId;
        this.aTokenAddress = aTokenAddress;
        this.bTokenAddress = bTokenAddress;

        this.on(SubscriptionEvents.OrderTaken, async (orderHash) => await this.refreshOrder());
        await this.refreshOrder();
    }

    async refreshOrder(): Promise<void> {
        const limitOrder = await this.createLimitOrder({
            inputToken: this.aTokenAddress,
            outputToken: this.bTokenAddress,
            inputAmount: 10n ** 18n,
            outputAmount: 10n ** 18n,
            chainId: this.chainId
        });

        console.log("Creating new order...");
        await this.makeOrder({ order: limitOrder, chainId: this.chainId });
    }
}