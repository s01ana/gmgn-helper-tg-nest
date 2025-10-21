import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Subscription {
  @Prop({ type: String })
  tokenAddress: string;

  @Prop({ type: String })
  devAddress: string;

  @Prop({ type: Number })
  devSellAmount: number;
}

export type SubscriptionDocument = Subscription & Document;
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);