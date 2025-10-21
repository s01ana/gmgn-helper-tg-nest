import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramService } from './telegram.service.js';
import { OrderSchema } from '../schema/order.schema.js';
import { SettingSchema } from '../schema/setting.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'order', schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: 'setting', schema: SettingSchema }]),
  ],
  providers: [TelegramService]
})
export class TelegramModule {}
