import { Model } from "mongoose";
import { Setting } from "../../schema/setting.schema.js";
import { bot } from "../../constant.js";
import handleDevSell from "./devSell.js";
import handleBuyAmount from "./buyAmount.js";
import handleFee from "./fee.js";
import handleSlippage from "./slippage.js";
import handleAutoSell from "./autoSell.js";
import handleSellTime from "./sellTime.js";

const callbackHandler = async (SettingModel: Model<Setting>) => {
  bot.on('callback_query', async (query) => {
    const chatId = query.message!.chat.id;
    const messageId = query.message!.message_id;
    const data = query.data;

    console.log(`callback query ${chatId}, callback data: ${data}`);

    if (!data)
      return;

    if (data === 'command_DevSell') handleDevSell(SettingModel, chatId, messageId);
    if (data === 'command_BuyAmount') handleBuyAmount(SettingModel, chatId, messageId);
    if (data === 'command_Fee') handleFee(SettingModel, chatId, messageId);
    if (data === 'command_Slippage') handleSlippage(SettingModel, chatId, messageId);
    if (data === 'command_AutoSell') handleAutoSell(SettingModel, chatId, messageId);
    if (data === 'command_SellTime') handleSellTime(SettingModel, chatId, messageId);
  });
}

export default callbackHandler;