import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerService } from './server.service.js';
import { ServerController } from './server.controller.js';
import { OrderSchema } from '../schema/order.schema.js';
import { SettingSchema } from '../schema/setting.schema.js';
import { SubscriptionSchema } from '../schema/subscription.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'order', schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: 'setting', schema: SettingSchema }]),
    MongooseModule.forFeature([{ name: 'subscription', schema: SubscriptionSchema }]),
  ],
  providers: [ServerService],
  controllers: [ServerController],
})
export class ServerModule {}
