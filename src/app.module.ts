import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TelegramModule } from './telegram/telegram.module.js';
import { ServerModule } from './server/server.module.js';
import { OnchainModule } from './onchain/onchain.module.js';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URL),
    TelegramModule,
    ServerModule,
    OnchainModule,
    ThrottlerModule.forRoot(
      {
        throttlers: [
          {
            ttl: 30000,
            limit: 3,
          }
        ]
      }
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
