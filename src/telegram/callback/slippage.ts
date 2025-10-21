import { Model } from "mongoose";
import { Setting } from "../../schema/setting.schema.js";
import { bot } from "../../constant.js";
import getMenuContent from "../utils/getMenuContent.js";
import switchMenu from "../utils/switchMenu.js";

const handleSlippage = async (SettingModel: Model<Setting>, chatId: number, messageId: number) => {
  bot.sendMessage(chatId, 'Please input slippage %');
  bot.once('message', async (newMsg) => {
    console.log(`${chatId}, slippage input: ${newMsg.text}`);
    try {
      const slippage = Number(newMsg.text);
      if (slippage < 0 || slippage > 100) {
        bot.sendMessage(chatId, 'Invalid value, Please input correct value');
        return;
      }
      const setting = await SettingModel.findOne({ chatId });
      if (!setting) {
        bot.sendMessage(chatId, 'No setting data, Please restart bot. /start');
        return;
      }
      setting.slippage = slippage;
      await setting.save();
      const { title, buttons } = await getMenuContent(SettingModel, chatId);
      switchMenu(chatId, messageId, title, buttons);
    } catch (error) {
      console.log(`${chatId}, Invalid number`);
      bot.sendMessage(chatId, `Invalid number, Please input correct number`);
    }
  })
}

export default handleSlippage;