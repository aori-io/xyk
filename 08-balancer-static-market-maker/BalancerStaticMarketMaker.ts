import { ERC20__factory, FromInventoryExecutor, formatIntoLimitOrder } from "@aori-io/sdk";
import { ethers, Wallet } from 'ethers';
import dotenv from 'dotenv'
dotenv.config()

const provider = new ethers.JsonRpcProvider('') as any;
const walletPrivateKey = process.env.PRIV_KEY;
const wallet = new Wallet(walletPrivateKey as any, provider);

type CurveSample = {
  tick: number;
  weight: number;
  weightedTokenAmount: number;
};

export class CPMMStatic extends FromInventoryExecutor {
    defaultOrder: {
        inputToken: string,
        outputToken: string,
        inputAmount: bigint,
        outputAmount: bigint,
        chainId: number
    } = undefined as any;

    aAmount!: bigint;
    bAmount!: bigint;
    aTokenAddress: string = "";
    bTokenAddress: string = "";

    async initialise({ chainId, aTokenAddress, bTokenAddress, t_min, t_max}: { chainId: number, aTokenAddress: string, bTokenAddress: string, aAmount: bigint, bAmount: bigint, t_min: bigint, t_max: bigint }): Promise<void> {
        await super.initialise();
        console.log("Initialised bot");

        const tokenA = await ERC20__factory.connect(aTokenAddress, this.provider);
        const tokenB = await ERC20__factory.connect(bTokenAddress, this.provider);

        const aAmount: bigint = await tokenA.balanceOf(this.wallet.address);
        const bAmount: bigint = await tokenB.balanceOf(this.wallet.address);

        this.aAmount = aAmount;
        this.bAmount = bAmount;
        this.aTokenAddress = aTokenAddress;
        this.bTokenAddress = bTokenAddress

        this.defaultOrder = {
            inputToken: aTokenAddress,
            outputToken: bTokenAddress,
            inputAmount: aAmount, 
            outputAmount: t_min,
            chainId
        };
    }

  // Compute the curve across which liquidity is provided
  curveFunction(t: number, s: number, a: number, b: number): number {
    return s * Math.pow(2 * Math.pow(a, b) * Math.pow(b, a), 1) * Math.exp(a - (t / 2));
  }

  calculateWeights(numberOfPoints: number, aAmount: number, s: number, a: number, b: number, t_min: number, t_max: number): CurveSample[] {
    const normAAmount = aAmount;

    // Sample the curve and compute weights
    const t = 10;  // Can be any value, 10 is used here as an example
    const sampleValue = this.curveFunction(t, s, a, b);
    const weights = Array(numberOfPoints).fill(0).map((_, idx) => this.curveFunction(t + idx, s, a, b) / sampleValue);

    // Normalise weights
    const totalWeight = weights.reduce((acc, curr) => acc + curr, 0);
    const normalizedWeights = weights.map(weight => weight / totalWeight);

    // Compute ticks between t_min and t_max
    const step = (t_max - t_min) / (numberOfPoints - 1);
    const ticks = Array(numberOfPoints).fill(0).map((_, idx) => t_min + idx * step);

    // Construct the output
    const output: CurveSample[] = ticks.map((tick, idx) => ({
        tick,
        weight: normalizedWeights[idx] * 100,
        weightedTokenAmount: Math.floor(normAAmount * normalizedWeights[idx])
    }));

    return output;
  }
    

    async refreshOrder(orderList: {
        tick: number;
        weight: number;
        weightedTokenAmount: number;
    }[]): Promise<void> {
        const offerer = this.wallet.address;
        const inputToken = this.aTokenAddress;
        const outputToken = this.bTokenAddress; 
        const chainId = 5;
        const provider = this.provider; 
    
        for(const order of orderList) {
            const inputAmount = BigInt(Math.floor(order.weightedTokenAmount));  
            const outputAmount = BigInt((order.weightedTokenAmount / order.tick)*10**18); 

            console.log(inputAmount, outputAmount)
    
            const makeOrder = await formatIntoLimitOrder({
                offerer,
                inputToken,
                inputAmount,
                outputToken,
                outputAmount,
                chainId,
                provider
            });

            await this.makeOrder({
                order: makeOrder,
                chainId
            })
        }
    }
    
};
