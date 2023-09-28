import { defaultOrderAddress, LimitOrderManager, OrderToExecute, Order__factory, ResponseEvents } from "@aori-io/sdk";
import { Signature } from "ethers";

export class ConstantMarketMaker extends LimitOrderManager {

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

        this.chainId = chainId;
        this.aTokenAddress = aTokenAddress;
        this.bTokenAddress = bTokenAddress;

        this.on(ResponseEvents.SubscriptionEvents.OrderTaken, async (orderHash) => {
            await this.refreshOrder();
        });

        this.on(ResponseEvents.NotificationEvents.OrderToExecute, async ({ parameters, signature }: OrderToExecute) => {
            const order = Order__factory.connect(defaultOrderAddress, this.provider);
            await order.settleOrders(parameters, Signature.from(signature));
        });

        this.defaultOrder = {
            inputToken: this.aTokenAddress,
            outputToken: this.bTokenAddress,
            inputAmount: aAmount,
            outputAmount: bAmount,
            chainId: this.chainId
        }
    }

    async refreshOrder(): Promise<void> {
        if (!this.defaultOrder) return;

        this.makeOrder({
            order: await this.createLimitOrder(this.defaultOrder),
            chainId: this.chainId
        });
    }
}