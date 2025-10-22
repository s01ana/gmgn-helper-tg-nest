import { Model } from 'mongoose';
import { ethers } from 'ethers';
import { InjectModel } from '@nestjs/mongoose';

import { Order } from '../schema/order.schema.js';
import { Setting } from '../schema/setting.schema.js';
import { Subscription } from '../schema/subscription.schema.js';

import handleBuy from './utils/handleBuy.js';
import handleSell from './utils/handleSell.js';

import { V2_CONTRACT_ADDRESS, bscProvider } from '../constant.js';
import { Cron, CronExpression } from '@nestjs/schedule';
import ERC20ABI from '../abi/erc20.js';
import { BotContext } from '../context/index.js';

export class OnchainService {
  constructor(
    @InjectModel('order')
    private OrderModel: Model<Order>,
    @InjectModel('setting')
    private SettingModel: Model<Setting>,
    @InjectModel('subscription')
    private SubscriptionModel: Model<Subscription>
  ) {
    this.startListenOnchain();
  }

  public startListenOnchain() {
    console.log('================startListenOnchain====================');
    const filter = {
      address: V2_CONTRACT_ADDRESS,
      topics: ['0x0a5575b3648bae2210cee56bf33254cc1ddfbc7bf637c0af2ac18b14fb1bae19']
    }
    
    try {
      bscProvider.on(filter, async (log) => {
        const abiCoder = new ethers.AbiCoder();
        const decodedLog = abiCoder.decode(['address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'], log.data);
        
        const tokenAddress = decodedLog.at(0);
        const devAddress = decodedLog.at(1);
  
        const amount = decodedLog.at(3);
  
        const subscription = await this.SubscriptionModel.findOne({
          tokenAddress: tokenAddress.toLowerCase(),
          devAddress: devAddress.toLowerCase()
        });
        if (subscription) {
          BotContext.set("Listener", "detected");
          console.log('[Listener]: Listened dev sell event for ', subscription.tokenAddress);
          subscription.devSellAmount = (BigInt(subscription.devSellAmount) + amount).toString();
          await subscription.save();
          console.log('[Listener]: devSellAmount: ', subscription.devSellAmount);
          await handleBuy(this.OrderModel, this.SettingModel, this.SubscriptionModel, subscription);
          BotContext.set("Listener", "handled");
        }
      })
    } catch (error) {
      console.error('[Listener]: ', error);
    }
  }

  @Cron('*/3 * * * * *')
  async handleSellsCron() {
    try {
      const orders = await this.OrderModel.find({ isBought: true, sellSeconds: { $lte: Math.floor(Date.now() / 1000) - 7 } });
      if (orders.length > 0) {
        console.info(`[handleSellsCron]: sell orders length: ${orders.length}`);
        await Promise.all(orders.map(order => handleSell(this.SettingModel, this.OrderModel, order)));
      }
    } catch (error) {
      console.error('[handleSellsCron]: ', error);
    }
  }

  @Cron('*/10 * * * *')
  async handleSubscriptionsCron() {
    if (BotContext.get("Listener") && BotContext.get("Listener") === "detected") {
      console.log('[handleSubscriptionsCron]: a token already detected, so skip');
      return;
    }
    try {
      const subscriptions = await this.SubscriptionModel.find({});
      console.info(`[handleSubscriptionsCron]: subscriptions length: ${subscriptions.length}`);
      if (subscriptions.length) {
        for (let i = 0; i < subscriptions.length; i++) {
          const devAddress = subscriptions[i].devAddress;
          const tokenAddress = subscriptions[i].tokenAddress;
          const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, bscProvider);
          const balance = await tokenContract.balanceOf(devAddress);

          console.log('[handleSubscriptionsCron]: balance: ', balance);

          if (balance && balance > 1000000000000000000n) {
            continue;
          }
          console.info(`[handleSubscriptionsCron]: devBalance is 0, so remove order ${tokenAddress}`);

          await this.SubscriptionModel.deleteMany({ tokenAddress: tokenAddress, devAddress: devAddress });

          await this.OrderModel.deleteMany({ tokenAddress: tokenAddress, isBought: false });
        }
      }
    } catch (error) {
      console.error(`[handleSubscriptionsCron]: error, ${error}`);
    }
  }
}