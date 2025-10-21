import { Model } from "mongoose";
import { Setting } from "../../schema/setting.schema.js";
import { bot, bscProvider } from "../../constant.js";
import getMenuContent from "../utils/getMenuContent.js";
import switchMenu from "../utils/switchMenu.js";

const handleFee = async (SettingModel: Model<Setting>, chatId: number, messageId: number) => {
  const feeData = await bscProvider.getFeeData();
  const gasPrice = feeData.gasPrice;
  bot.sendMessage(chatId, `Please input fee in Gwei\nWe recommend to use ${Number(gasPrice?.toString()) / 10**9} Gwei`);
  bot.once('message', async (newMsg) => {
    console.log(`${chatId}, fee amount input: ${newMsg.text}`);
    try {
      const fee = Number(newMsg.text);
      if (fee < 0) {
        bot.sendMessage(chatId, 'Invalid value, Please input correct value');
        return;
      }
      const setting = await SettingModel.findOne({ chatId });
      if (!setting) {
        bot.sendMessage(chatId, 'No setting data, Please restart bot. /start');
        return;
      }
      setting.fee = fee;
      await setting.save();
      const { title, buttons } = await getMenuContent(SettingModel, chatId);
      switchMenu(chatId, messageId, title, buttons);
    } catch (error) {
      console.log(`${chatId}, Invalid number`);
      bot.sendMessage(chatId, `Invalid number, Please input correct number`);
    }
  })
}

export default handleFee;