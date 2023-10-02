import { ERC20__factory, FromInventoryExecutor } from "@aori-io/sdk";

export class CPMMStatic extends FromInventoryExecutor {
    defaultOrder: {
        inputToken: string,
        outputToken: string,
        inputAmount: bigint,
        outputAmount: bigint,
        chainId: number
    } = undefined as any;

    sqrtK!: number;
    numberOfOrders!: number;
    K!: bigint;
    range!: number;

    async initialise({ chainId, aTokenAddress, bTokenAddress, t_min, t_max }: { chainId: number, aTokenAddress: string, bTokenAddress: string, aAmount: bigint, bAmount: bigint, t_min: bigint, t_max: bigint }): Promise<void> {
        super.initialise();
        console.log("Initialised bot");

        const tokenA = ERC20__factory.connect(aTokenAddress, this.provider)
        const tokenB = ERC20__factory.connect(bTokenAddress, this.provider)

        const aAmount: bigint = await tokenA.balanceOf(this.wallet.address);
        const bAmount: bigint = await tokenB.balanceOf(this.wallet.address);

        this.K = aAmount * bAmount;
        this.sqrtK = Math.sqrt(Number(this.K));
        this.range = Number(t_max-t_min);
        this.numberOfOrders = Math.floor(this.range/this.sqrtK);


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
    
        let currentOutputAmount = Number(this.defaultOrder.outputAmount);
        const incrementAmount = this.range/this.sqrtK;

        const midPoint = this.range / 2;
        const lmsrFactor = 0.1; // Degree to which liquidity is concentrated around midpoint; higher = more concentrated
    
        for (let i = 1; i <= this.numberOfOrders; i++) {
            const distanceFromMid = Math.abs(midPoint - currentOutputAmount);
            const lmsrAdjustment = Math.exp(-lmsrFactor * distanceFromMid / midPoint);
    
            const adjustedOutputAmount = currentOutputAmount * lmsrAdjustment;
    
            this.makeOrder({
                order: await this.createLimitOrder({
                    ...this.defaultOrder,
                    inputAmount: this.defaultOrder.inputAmount,
                    outputAmount: BigInt(Math.round(adjustedOutputAmount))
                }),
                chainId: this.defaultOrder.chainId
            });
    
            currentOutputAmount += incrementAmount;
        }
    }
};