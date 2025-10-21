import { ethers } from "ethers";
import { Model } from "mongoose";
import BigNumber from "bignumber.js";
import { bscProvider } from "../../constant.js";
import { Setting } from "../../schema/setting.schema.js";

const getMenuContent = async (SettingModel: Model<Setting>, chatId: number) => {

  const setting = await SettingModel.findOne({ chatId });
  if (!setting) {
    return { title: "Setting not found", buttons: [] };
  }

  let title = "";
  try {
    const signer = new ethers.Wallet(setting.key, bscProvider);
    const balance = new BigNumber((await bscProvider.getBalance(signer.address)).toString()).div(10 ** 18);
    title = `👋Hi, <code>${setting.userName}</code>, Welcome to RonyX bot.\n\nUser ID: <code>${chatId}</code>\n\nYou can connect bot using user id in chrome extension.\n\n💵Wallet: ${balance.toString()} BNB\n<code>${signer.address}</code>\n`;
  } catch (error) {
    title = `👋Hi, <code>${setting.userName}</code>, Welcome to RonyX bot.\n\nUser ID: <code>${chatId}</code>\n\nYou can connect bot using user id in chrome extension.\n\n💵Wallet: NO Wallet. To set /wallet\n`;
  }

  const buttons = [
    [
      { text: `Dev sell rate: ${setting.devSellRate} %`, callback_data: `command_DevSell` },
      { text: `Buy amount: ${setting.buyAmount} BNB`, callback_data: `command_BuyAmount` }
    ],
    [
      { text: `Gas Fee: ${setting.fee} Gwei`, callback_data: `command_Fee` },
      { text: `Slippage: ${setting.slippage} %`, callback_data: `command_Slippage` }
    ],
    [
      { text: `Auto sell: ${setting.autoSell ? '✅' : '🚫'}`, callback_data: `command_AutoSell` },
      { text: `⏲️ Sell time: ${setting.sellTime} seconds later`, callback_data: `command_SellTime` }
    ]
  ]
  return { title, buttons };
}

export default getMenuContent;