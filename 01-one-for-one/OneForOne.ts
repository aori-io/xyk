import { defaultOrderAddress, LimitOrderManager, OrderToExecute, Order__factory, ResponseEvents } from "@aori-io/sdk";
import { Signature } from "ethers";

export class OneForOneBot extends LimitOrderManager {

    aTokenAddress: string = "";
    bTokenAddress: string = "";
    chainId: number = 5;

    async initialise({ chainId, aTokenAddress, bTokenAddress }: { chainId: number, aTokenAddress: string, bTokenAddress: string }): Promise<void> {
        console.log("Initialised bot");
        super.initialise();

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