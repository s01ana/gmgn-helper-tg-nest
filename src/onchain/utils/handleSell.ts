
import { Model } from "mongoose";
import { Order } from "../../schema/order.schema.js";
import { Setting } from "../../schema/setting.schema.js";
import sellToken from "./sell.js";

const handleSell = async (SettingsModel: Model<Setting>, OrderModel: Model<Order>, order: any) => {
  try {
    const setting = await SettingsModel.findOne({ chatId: order.chatId });
    if (!setting) {
      console.error(`[HandleSell]: setting not found, sellOrder: ${order.chatId} ${order.tokenAddress}`);
      return;
    }
    const tx = await sellToken(setting.key, order);
    if (!tx) {
      console.error(`[HandleSell]: transaction failed, sellOrder: ${order.chatId} ${order.tokenAddress}`);
      return;
    }
    await OrderModel.deleteOne({ _id: order._id });
  } catch (error) {
    console.error(`[HandleSell]: error, sellOrder: ${order.chatId} ${order.tokenAddress} ${error}`);
  }
}

export default handleSell;