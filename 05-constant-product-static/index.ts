import "dotenv/config";
import { AnkrProvider, Wallet } from "ethers";
import { ConstantProductStaticMarketMaker } from "./CPsMM";

const wallet = new Wallet(process.env.BOT_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000")
const provider = new AnkrProvider(process.env.CHAIN || "goerli", process.env.ANKR_API_KEY);

const bot = new ConstantProductStaticMarketMaker({
    wallet,
    provider
});

bot.on("ready", async () => {
    await bot.initialise({
        aTokenAddress: process.env.A_TOKEN_ADDRESS || "",
        bTokenAddress: process.env.B_TOKEN_ADDRESS || "",
        t_min: 2n * 10n ** 18n,
        t_max: 10n * 10n ** 18n,
        chainId: 5,
        samplingFactor: 2n
    });
});