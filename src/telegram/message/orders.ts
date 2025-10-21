import TelegramBot from "node-telegram-bot-api";
import { Model } from "mongoose";
import { Order } from "../../schema/order.schema.js";
import { bot } from "../../constant.js";

const orderHandler = async (OrderModel: Model<Order>) => {
  bot.onText(/\/orders/, async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const orders = await OrderModel.find({ chatId, isBought: false });
    let message = '';
    for (let i = 0; i < orders.length; i++) {
      message += `Order ${i + 1}: \n`;
      message += `Token: ${orders[i].tokenName} (${orders[i].tokenSymbol})\n`;
      message += `CA: <code>${orders[i].tokenAddress}</code>\n`;
      message += `Order Type: ${orders[i].orderType === "devSell" ? "DEV SELL" : "LAST SELL"}\n\n`;
    }
    if (message === '') {
      message = 'No orders';
    }
    bot.sendMessage(chatId, message, {
      parse_mode: 'HTML'
    });
  });
}

export default orderHandler;