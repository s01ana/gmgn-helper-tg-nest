import { Model } from "mongoose";
import { Setting } from "../../schema/setting.schema.js";
import { bot } from "../../constant.js";
import getMenuContent from "../utils/getMenuContent.js";
import switchMenu from "../utils/switchMenu.js";

const handleSellTime = async (SettingModel: Model<Setting>, chatId: number, messageId: number) => {
  bot.sendMessage(chatId, 'Please input sell time in seconds. (>1s)');
  bot.once('message', async (newMsg) => {
    console.log(`${chatId}, sell time input: ${newMsg.text}`);
    try {
      const sellTime = Number(newMsg.text);
      if (sellTime < 1) {
        bot.sendMessage(chatId, 'Invalid value, Please input sell time (>1s)');
        return;
      }
      const setting = await SettingModel.findOne({ chatId });
      if (!setting) {
        bot.sendMessage(chatId, 'No setting data, Please restart bot. /start');
        return;
      }
      setting.sellTime = sellTime;
      await setting.save();
      const { title, buttons } = await getMenuContent(SettingModel, chatId);
      switchMenu(chatId, messageId, title, buttons);
    } catch (error) {
      console.log(`${chatId}, Invalid number`);
      bot.sendMessage(chatId, `Invalid number, Please input correct number`);
    }
  })
}

export default handleSellTime;