import { Model } from "mongoose";
import { Setting } from "../../schema/setting.schema.js";
import { bot } from "../../constant.js";
import getMenuContent from "../utils/getMenuContent.js";
import switchMenu from "../utils/switchMenu.js";

const handleAutoSell = async (SettingModel: Model<Setting>, chatId: number, messageId: number) => {
  const setting = await SettingModel.findOne({ chatId });
  if (!setting) {
    bot.sendMessage(chatId, 'No setting data, Please restart bot. /start');
    return;
  }
  setting.autoSell = !setting.autoSell
  await setting.save();
  const { title, buttons } = await getMenuContent(SettingModel, chatId);
  switchMenu(chatId, messageId, title, buttons);
}

export default handleAutoSell;