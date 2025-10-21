import { Model } from "mongoose";
import { Setting } from "../../schema/setting.schema.js";
import { bot } from "../../constant.js";
import getMenuContent from "../utils/getMenuContent.js";
import switchMenu from "../utils/switchMenu.js";

const handleDevSell = async (SettingModel: Model<Setting>, chatId: number, messageId: number) => {
  bot.sendMessage(chatId, 'Please input dev sell rate');
  bot.once('message', async (newMsg) => {
    try {
      const devSellRate = Number(newMsg.text);
      if (devSellRate < 0 || devSellRate > 100) {
        console.log(`${chatId} invalid dev sell rate input : ${devSellRate} `);
        bot.sendMessage(chatId, `Invalid value. Please input correct value`);
        return;
      }
      console.log(`${chatId} dev sell rate input ${devSellRate} %`);
      const setting = await SettingModel.findOne({ chatId });
      if (setting) {
        setting.devSellRate = devSellRate;
        await setting.save();
        const { title, buttons } = await getMenuContent(SettingModel, chatId);
        switchMenu(chatId, messageId, title, buttons);
      }
    } catch (error) {
      console.log(`${chatId}, invalid dev sell rate`);
      bot.sendMessage(chatId, `Invalid number. Please input correct number`);
      return;
    }
  })
}

export default handleDevSell;