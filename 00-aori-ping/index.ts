import { AoriProvider } from "@aori-io/sdk";
import "dotenv/config";
import { AnkrProvider, Wallet } from "ethers";

const wallet = new Wallet(process.env.BOT_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000")
const provider = new AnkrProvider(process.env.CHAIN || "goerli", process.env.ANKR_API_KEY);

const bot = new AoriProvider({
    wallet,
    provider
});

bot.on("ready", async () => {
    await bot.ping();
});