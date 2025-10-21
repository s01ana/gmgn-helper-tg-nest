import { Model } from "mongoose";
import { Setting } from "../../schema/setting.schema.js";
import { bot } from "../../constant.js";
import getMenuContent from "../utils/getMenuContent.js";
import switchMenu from "../utils/switchMenu.js";

const handleBuyAmount = async (SettingModel: Model<Setting>, chatId: number, messageId: number) => {
  bot.sendMessage(chatId, 'Please input buy amount in BNB');
  bot.once('message', async (newMsg) => {
    try {
      const buyAmount = Number(newMsg.text);
      if (buyAmount < 0) {
        bot.sendMessage(chatId, 'Invalid value, Please input correct value');
        return;
      }
      const setting = await SettingModel.findOne({ chatId });
      if (!setting) {
        bot.sendMessage(chatId, 'No setting data, Please restart bot. /start');
        return;
      }
      setting.buyAmount = buyAmount;
      await setting.save();
      const { title, buttons } = await getMenuContent(SettingModel, chatId);
      switchMenu(chatId, messageId, title, buttons);
    } catch (error) {
      console.log(`${chatId}, Invalid number`);
      bot.sendMessage(chatId, `Invalid number, Please input correct number`);
    }
  })
}

export default handleBuyAmount;