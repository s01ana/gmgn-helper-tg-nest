import { Model } from 'mongoose';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { InjectModel } from '@nestjs/mongoose';

import { Order } from '../schema/order.schema.js';
import { Setting } from '../schema/setting.schema.js';
import { Subscription } from '../schema/subscription.schema.js';

import { SubscriptionContext } from '../context/index.js';
import sendMessage from '../telegram/utils/sendMessage.js';
import { bscProvider } from '../constant.js';
import ERC20ABI from '../abi/erc20.js';

export class ServerService {
  constructor(
    @InjectModel('order')
    private OrderModel: Model<Order>,
    @InjectModel('setting')
    private SettingModel: Model<Setting>,
    @InjectModel('subscription')
    private SubscriptionModel: Model<Subscription>
  ) {
    this.syncSubscriptions();
  }

  async connectServer(data: any) {
    console.log(`connect, data: `, data);
    try {
      const userId = Number(data.userId);
      console.log('connect request userId: ', userId);
      const setting = await this.SettingModel.findOne({ chatId: userId });
      if (setting) {
        return { result: true, message: 'Connected.' };
      } else {
        return { result: false, message: 'Invalid User ID.' };
      }
    } catch (error) {
        return { result: false, message: 'Invalid User ID.' };
    }
  }

  async handleOrder(data: any) {
    try {
      const chatId = Number(data.userId);
      const tokenAddress = data.tokenAddress;
      const devAddress = data.creator;
      const orderType = data.orderType;
  
      const tokenName = data.name;
      const tokenSymbol = data.symbol;
  
      const creatorAmount = data.creatorBalance;
  
      // check user
      const setting = await this.SettingModel.findOne({ chatId });
      if (!setting) {
        console.log(`[CreateOrder]: Not user chatId ${chatId}`);
        return { status: false, message: 'No registered user' };
      }
  
      if (orderType === "devSell" || orderType === "lastSell") {
        let type = orderType === "devSell" ? "Dev Sell" : "Last Sell";
        let order = await this.OrderModel.findOne({
          chatId,
          tokenAddress,
          isBought: false
        })
  
        if (order) {
          // sendMessage(chatId, `⚠️ (${type}) Order already exists for ${tokenSymbol} ( ${tokenName} )\nCA: <code>${tokenAddress}</code>`);
          return { status: false, message: 'Order is already created' };
        }

        const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, bscProvider);

        const balance = new BigNumber((await tokenContract.balanceOf(devAddress)).toString()).div(10 ** 18);
        if (balance.plus(1).lt(creatorAmount) || balance.lte(1)) {
          // sendMessage(chatId, `❌ Creator balance is insufficient. Please add more balance to your wallet.`);
          return { status: false, message: 'Dev Sold already!' };
        } 
  
        // save order
        order = new this.OrderModel({
          chatId: chatId,
          tokenAddress,
          devAddress,
          orderType,
          tokenName,
          tokenSymbol,
          creatorAmount,
          isBought: false,
          sellSeconds: 0
        });
  
        await order.save();
  
        let subscription = await this.SubscriptionModel.findOne({
          tokenAddress,
          devAddress
        });
  
        if (!subscription) {
          subscription = new this.SubscriptionModel({
            tokenAddress,
            devAddress
          });
  
          await subscription.save();
  
          SubscriptionContext.push({
            tokenAddress,
            devAddress
          })
        }
  
        sendMessage(chatId, `✅ New Order (${type}) is created for ${tokenSymbol} ( ${tokenName} )\nCA: <code>${tokenAddress}</code>`);
  
        return { status: true, message: 'Order is successfully created.' };
      } else if (orderType === "cancel") {
        let orders = await this.OrderModel.find({
          chatId,
          tokenAddress,
          isBought: false
        })
  
        if (orders.length == 0) {
          sendMessage(chatId, `⚠️ Any Order doesn't exist for ${tokenSymbol} ( ${tokenName} )\nCA: <code>${tokenAddress}</code>`);
  
          return { status: false, message: 'Order not existed' };
        }
  
        await this.OrderModel.deleteMany({
          chatId,
          tokenAddress,
          isBought: false
        });
  
        const similarOrders = await this.OrderModel.find({ tokenAddress, isBought: false });
        if (similarOrders.length == 0) {
          await this.SubscriptionModel.deleteOne({ tokenAddress, devAddress });
          SubscriptionContext.splice(SubscriptionContext.findIndex(subscription => subscription.tokenAddress === tokenAddress && subscription.devAddress === devAddress), 1);
        }
  
        sendMessage(chatId, `❌ All Orders cancelled for ${tokenSymbol} ( ${tokenName} )\nCA: <code>${tokenAddress}</code>`);
  
        return { status: true, message: 'Order is successfully cancelled.' };
      }
    } catch (err) {
      console.error('[CreateOrder]: ', err);
      return { status: false, message: 'Server unexpected error.' };
    }
  }

  public async syncSubscriptions() {
    console.log('================syncSubscriptions====================');
    try {
      const subscriptions = await this.SubscriptionModel.find({});
      if (subscriptions.length > 0) {
        for (let i = 0; i < subscriptions.length; i++) {
          SubscriptionContext.push({
            tokenAddress: subscriptions[i].tokenAddress,
            devAddress: subscriptions[i].devAddress
          });
        }
      }
      console.info('[syncSubscriptions]: subscriptions length: ', SubscriptionContext.length);
    } catch (error) {
      console.error('[syncSubscriptions]: error, ', error);
    }
  }
}

export default ServerService;