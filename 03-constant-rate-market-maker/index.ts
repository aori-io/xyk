import "dotenv/config";
import { AnkrProvider, Wallet } from "ethers";
import { ConstantRateMarketMaker } from "./CrMM";

const wallet = new Wallet(process.env.BOT_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000")
const provider = new AnkrProvider(process.env.CHAIN || "goerli", process.env.ANKR_API_KEY);

const bot = new ConstantRateMarketMaker({
    wallet,
    provider
});

bot.on("ready", async () => {
    await bot.initialise({
        aTokenAddress: process.env.A_TOKEN_ADDRESS || "",
        bTokenAddress: process.env.B_TOKEN_ADDRESS || "",
        aAmount: 10n ** 18n,
        bAmount: 2n * 10n ** 18n,
        chainId: 5,
        interval: 60 * 60 * 1000 // 1 hour
    });
});