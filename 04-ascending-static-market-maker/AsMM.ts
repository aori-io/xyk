import { FromInventoryExecutor } from "@aori-io/sdk";

export class AscendingStaticMarketMaker extends FromInventoryExecutor {

    numberOfOrders: number = 0;
    percentageMultiplier: bigint = 100n; // Note: multiplier is in percentage
    defaultOrder: {
        inputToken: string,
        outputToken: string,
        inputAmount: bigint,
        outputAmount: bigint,
        chainId: number
    } = undefined as any;


    async initialise({ chainId, aTokenAddress, bTokenAddress, aAmount, bAmount, numberOfOrders, percentageMultiplier }: { chainId: number, aTokenAddress: string, bTokenAddress: string, aAmount: bigint, bAmount: bigint, numberOfOrders: number, percentageMultiplier: bigint }): Promise<void> {
        super.initialise();
        console.log("Initialised bot");

        this.defaultOrder = {
            inputToken: aTokenAddress,
            outputToken: bTokenAddress,
            inputAmount: aAmount,
            outputAmount: bAmount,
            chainId
        };
        this.numberOfOrders = numberOfOrders;
        this.percentageMultiplier = percentageMultiplier;

        // Only ran once
        await this.refreshOrder();
    }

    async refreshOrder(): Promise<void> {
        if (!this.defaultOrder) return;

        for (let i = 1n; i <= this.numberOfOrders; i++) {
            this.makeOrder({
                order: await this.createLimitOrder({
                    ...this.defaultOrder,
                    inputAmount: this.defaultOrder.inputAmount,
                    outputAmount: this.defaultOrder.outputAmount * i * this.percentageMultiplier / 100n
                }),
                chainId: this.defaultOrder.chainId
            })
        };
    }
}