import "dotenv/config";
import { AnkrProvider, Wallet } from "ethers";
import { WebSocket } from "ws";
import { OneForOneBot } from "./OneForOne";

const ws = new WebSocket(process.env.BOTS_WEBSOCKET_URL || "ws://localhost:8080");
const subscriptions = new WebSocket(process.env.BOTS_SUBSCRIPTION_URL || "ws://localhost:8081");
const wallet = new Wallet(process.env.BOT_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000")
const provider = new AnkrProvider(process.env.CHAIN || "goerli", process.env.ANKR_API_KEY);

ws.on("open", async () => {
    const bot = new OneForOneBot(
        ws,
        subscriptions,
        wallet,
        provider
    );

    await bot.initialise({
        aTokenAddress: process.env.A_TOKEN_ADDRESS || "",
        bTokenAddress: process.env.B_TOKEN_ADDRESS || "",
        chainId: 5
    });
});

ws.on("error", (e) => {
    console.log(e);
});