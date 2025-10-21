import TelegramBot from "node-telegram-bot-api";
import { ethers } from "ethers";
import { Model } from "mongoose";
import { Setting } from "../../schema/setting.schema.js";
import { bot, bscProvider } from "../../constant.js";
import getMenu from "../utils/getMenuContent.js";

const walletHandler = async (SettingModel: Model<Setting>) => {
  bot.onText(/\/wallet/, async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "Please input private key of wallet");
    bot.once('message', async (newMsg: TelegramBot.Message) => {
      try {
        if (newMsg.text) {
          const signer = new ethers.Wallet(newMsg.text, bscProvider);
          const setting = await SettingModel.findOne({ chatId });
          if (!setting) {
            bot.sendMessage(chatId, "No setting data, Please restart bot. /start");
            return;
          }
          setting.key = newMsg.text;
          await setting.save();
          
          const { title, buttons } = await getMenu(SettingModel, chatId);

          bot.sendMessage(chatId, title, {
            reply_markup: {
              inline_keyboard: buttons
            },
            parse_mode: 'HTML'
          })
        }
      } catch (error) {
        console.log(`${chatId} Invalid private key`);
        bot.sendMessage(chatId, "Invalid private key, Please try again");
        return;
      }
    })
  });
}

export default walletHandler;