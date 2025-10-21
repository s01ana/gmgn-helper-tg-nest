import express from 'express';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';

import { Order } from '../schema/order.schema.js';
import { Setting } from '../schema/setting.schema.js';

import { TELEGRAM_BOT_PORT, bot } from '../constant.js';
import startHandler from './message/start.js';
import walletHandler from './message/wallet.js';
import ordersHandler from './message/orders.js';

import callbackHandler from './callback/index.js';

export class TelegramService {
  public app: express.Application;
  private server: any; // Store server instance

  constructor(
    @InjectModel('order')
    private OrderModel: Model<Order>,
    @InjectModel('setting')
    private SettingModel: Model<Setting>
  ) {
    this.app = express();
    this.start(TELEGRAM_BOT_PORT);
  }

  public start(port: number) {
    this.server = this.app.listen(port, () => {
      this.startTelegramBot();
    });

    // Handle graceful shutdown
    const gracefulShutdown = () => {
      console.log('Received shutdown signal, closing server...');
      this.server.close(() => {
        console.log('Server closed successfully');
        process.exit(0);
      });

      // Force close after 5 seconds if server hasn't closed
      setTimeout(() => {
        console.log(
          'Could not close connections in time, forcefully shutting down',
        );
        process.exit(1);
      }, 5000);
    };

    // Handle different shutdown signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  }

  public async stop() {
    if (this.server) {
      this.server.close(() => {
        console.log('Server stopped');
      });
    }
  }

  public startTelegramBot() {
    console.log('================startTelegramBot====================');
    bot.setMyCommands([
      { command: 'start', description: 'Start the bot' },
      { command: 'wallet', description: 'Show your wallet'},
      { command: 'orders', description: 'Show your orders'}
    ], { scope: { type: 'default' } });
  
    startHandler(this.SettingModel);
    walletHandler(this.SettingModel);
    ordersHandler(this.OrderModel);
  
    callbackHandler(this.SettingModel);
  }
}