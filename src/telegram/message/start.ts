import TelegramBot from "node-telegram-bot-api";
import { Model } from "mongoose";
import { Setting } from "../../schema/setting.schema.js";
import { bot, bscProvider } from "../../constant.js";
import getMenu from "../utils/getMenuContent.js";

const startHandler = async (SettingModel: Model<Setting>) => {
  bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const userName = msg.chat.username;

    const setting = await SettingModel.findOne({ chatId });

    if (!setting) {
      const feeData = await bscProvider.getFeeData();
      const gasPrice = feeData.gasPrice;

      const setting = new SettingModel({
        chatId,
        userName: userName || "",
        devSellRate: 30,
        buyAmount: 1,
        fee: Number(gasPrice?.toString()) / 10**9,
        autoSell: false,
        sellTime: 3,
        key: "",
        slippage: 10
      })
      await setting.save();
    }

    const { title, buttons } = await getMenu(SettingModel, chatId);

    bot.sendMessage(chatId, title, {
      reply_markup: {
        inline_keyboard: buttons
      },
      parse_mode: 'HTML'
    })
  });
}

export default startHandler;