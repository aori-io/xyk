import { ERC20__factory, FromInventoryExecutor } from "@aori-io/sdk";

export class ConstantProductStaticMarketMaker extends FromInventoryExecutor {
    defaultOrder: {
        inputToken: string,
        outputToken: string,
        inputAmount: bigint,
        outputAmount: bigint,
        chainId: number
    } = undefined as any;

    t_min: bigint = 0n;
    t_max: bigint = 0n;
    sqrtK: bigint = 0n;
    numberOfOrders!: number;
    samplingFactor!: bigint;

    async initialise({ chainId, aTokenAddress, bTokenAddress, t_min, t_max, samplingFactor }: { chainId: number, aTokenAddress: string, bTokenAddress: string, t_min: bigint, t_max: bigint, samplingFactor: bigint }): Promise<void> {
        super.initialise();
        console.log("Initialised bot");

        const tokenA = ERC20__factory.connect(aTokenAddress, this.provider)
        const tokenB = ERC20__factory.connect(bTokenAddress, this.provider)

        const aAmount: bigint = await tokenA.balanceOf(this.wallet.address);
        const bAmount: bigint = await tokenB.balanceOf(this.wallet.address);

        this.t_min = t_min;
        this.t_max = t_max;
        this.sqrtK = BigInt(Math.sqrt(Number(aAmount * bAmount)));
        this.numberOfOrders = Number((this.t_max - t_min) * this.samplingFactor / this.sqrtK);
        this.samplingFactor = samplingFactor;

        this.defaultOrder = {
            inputToken: aTokenAddress,
            outputToken: bTokenAddress,
            inputAmount: aAmount,
            outputAmount: t_min,
            chainId
        };
    };

    async refreshOrder(): Promise<void> {
        if (!this.defaultOrder) return;
        if (this.samplingFactor == 0n) this.samplingFactor = 1n;

        let currentOutputAmount = this.t_min;
        const incrementAmount = (this.t_max - this.t_min) / this.sqrtK / this.samplingFactor;

        for (let i = 1; i <= this.numberOfOrders; i++) {
            currentOutputAmount += incrementAmount;

            this.makeOrder({
                order: await this.createLimitOrder({
                    ...this.defaultOrder,
                    inputAmount: this.sqrtK / this.samplingFactor,
                    outputAmount: currentOutputAmount
                }),
                chainId: this.defaultOrder.chainId
            });
        }
    }
};
