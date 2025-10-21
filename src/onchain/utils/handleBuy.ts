import { Model } from "mongoose";

import { Order } from "../../schema/order.schema.js";
import { Setting } from "../../schema/setting.schema.js";
import { Subscription } from "../../schema/subscription.schema.js";
import sendMessage from "../../telegram/utils/sendMessage.js";
import { SubscriptionContext } from "../../context/index.js";

import buyToken from "./buy.js";

const handleBuy = async (
  OrderModel: Model<Order>,
  SettingModel: Model<Setting>,
  SubscriptionModel: Model<Subscription>,
  subscription: any, 
  amount: bigint
) => {
  const orders = await OrderModel.find({
    tokenAddress: subscription.tokenAddress,
    isBought: false
  })

  if (orders.length == 0) {
    console.info('[handleBuy]: no orders');
    return;
  }

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const setting = await SettingModel.findOne({ chatId: order.chatId });

    if (!setting) {
      console.info(`[handleBuy]: no setting, user: ${order.chatId}`);
      continue;
    }

    if (!setting.key) {
      console.info(`[handleBuy]: no key, user: ${setting.userName}`);
      continue;
    }

    if (order.orderType === "devSell") {
      if (amount > BigInt(order.creatorAmount * setting.devSellRate / 100 * 10**18)) {
        // buy token
        const tx = await buyToken(setting.key, subscription.tokenAddress, setting.buyAmount, order.chatId);

        if (!tx) {
          console.error(`[handleBuy]: buyToken error, user: ${setting.userName}`);
          continue;
        }

        sendMessage(order.chatId, `📈 Bought ${setting.buyAmount} ${order.tokenName} (${order.tokenSymbol}) successfully\nCA: <code>${order.tokenAddress}</code>\n` +
          `<a href="https://bscscan.com/tx/${tx.hash}">View on BscScan</a>`);

        if (setting.autoSell) {
          order.isBought = true;
          order.sellSeconds = Math.floor(Date.now() / 1000) + setting.sellTime;
          await order.save();
        }

        const similarOrders = await OrderModel.find({ tokenAddress: subscription.tokenAddress, devAddress: subscription.devAddress, isBought: false });
        if (similarOrders.length == 0) {
          await SubscriptionModel.deleteOne({ 
            tokenAddress: subscription.tokenAddress, 
            devAddress: subscription.devAddress 
          });
          SubscriptionContext.splice(SubscriptionContext.findIndex(
            subscription => 
              subscription.tokenAddress === subscription.tokenAddress && 
              subscription.devAddress === subscription.devAddress
          ), 1);
        }
      } else {
        console.info(`[handleBuy]: no dev sell, user: ${setting.userName}`);
      }
    } else if (order.orderType === "lastSell") {
      if (amount > BigInt(order.creatorAmount * 10**18)) {
        // buy token
        const tx = await buyToken(setting.key, subscription.tokenAddress, setting.buyAmount, order.chatId);

        if (!tx) {
          console.error(`[handleBuy]: buyToken error, user: ${setting.userName}`);
          continue;
        }

        sendMessage(order.chatId, `📈 Bought ${setting.buyAmount} ${order.tokenName} (${order.tokenSymbol}) successfully\nCA: <code>${order.tokenAddress}</code>\n` +
          `<a href="https://bscscan.com/tx/${tx.hash}">View on BscScan</a>`);

        if (setting.autoSell) {
          order.isBought = true;
          order.sellSeconds = Math.floor(Date.now() / 1000) + setting.sellTime;
          await order.save();
        }

        const similarOrders = await OrderModel.find({ tokenAddress: subscription.tokenAddress, devAddress: subscription.devAddress, isBought: false });
        if (similarOrders.length == 0) {
          await SubscriptionModel.deleteOne({ 
            tokenAddress: subscription.tokenAddress, 
            devAddress: subscription.devAddress 
          });
          SubscriptionContext.splice(SubscriptionContext.findIndex(
            subscription => 
              subscription.tokenAddress === subscription.tokenAddress && 
              subscription.devAddress === subscription.devAddress
          ), 1);
        }
      } else {
        console.info(`[handleBuy]: no last sell, user: ${setting.userName}`);
      }
    }
  }
}

export default handleBuy;