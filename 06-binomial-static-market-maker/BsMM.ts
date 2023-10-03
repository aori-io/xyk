import { ERC20__factory, FromInventoryExecutor } from "@aori-io/sdk";

export class BinomialStaticMarketMaker extends FromInventoryExecutor {
    defaultOrder: {
        inputToken: string,
        outputToken: string,
        inputAmount: bigint,
        outputAmount: bigint,
        chainId: number
    } = undefined as any;

    dropoffPercentage: bigint = 0n;
    numberOfOrders: bigint = 0n;

    async initialise({ chainId, aTokenAddress, bTokenAddress, dropoffPercentage, numberOfOrders }: { chainId: number, aTokenAddress: string, bTokenAddress: string, dropoffPercentage: bigint, numberOfOrders: bigint }): Promise<void> {
        super.initialise();
        console.log("Initialised bot");

        const tokenA = ERC20__factory.connect(aTokenAddress, this.provider)
        const tokenB = ERC20__factory.connect(bTokenAddress, this.provider)

        const aAmount: bigint = await tokenA.balanceOf(this.wallet.address);
        const bAmount: bigint = await tokenB.balanceOf(this.wallet.address);

        this.dropoffPercentage = dropoffPercentage;
        this.numberOfOrders = numberOfOrders;

        this.defaultOrder = {
            inputToken: aTokenAddress,
            outputToken: bTokenAddress,
            inputAmount: aAmount,
            outputAmount: bAmount,
            chainId
        };
    };

    async refreshOrder(): Promise<void> {
        if (!this.defaultOrder) return;

        const inputMidpoint = this.defaultOrder.inputAmount;
        const sideOrders = (this.numberOfOrders - 1n) / 2n;
        // TODO: check logic on computation of outputQuantity
        const outputQuantityPer = this.defaultOrder.outputAmount / this.numberOfOrders;

        this.makeOrder({
            order: await this.createLimitOrder({
                ...this.defaultOrder,
                inputAmount: inputMidpoint,
                outputAmount: outputQuantityPer
            }),
            chainId: this.defaultOrder.chainId
        });

        for (let i = 1n; i <= sideOrders; i++) {
            this.makeOrder({
                order: await this.createLimitOrder({
                    ...this.defaultOrder,
                    inputAmount: inputMidpoint * this._powerBI(this.dropoffPercentage, i),
                    outputAmount: outputQuantityPer
                }),
                chainId: this.defaultOrder.chainId
            });

            this.makeOrder({
                order: await this.createLimitOrder({
                    ...this.defaultOrder,
                    inputAmount: inputMidpoint / (this._powerBI(this.dropoffPercentage, i)),
                    outputAmount: outputQuantityPer
                }),
                chainId: this.defaultOrder.chainId
            })
        }
    }

    _powerBI(basePercentage: bigint, exponent: bigint): bigint {
        return basePercentage ** exponent / (100n ** (exponent - 1n));
    }
};
