import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Order {
  @Prop({ type: Number })
  chatId: number;

  @Prop({ type: String })
  tokenAddress: string;

  @Prop({ type: String })
  devAddress: string;

  @Prop({ type: String })
  orderType: string;

  @Prop({ type: String })
  tokenName: string;

  @Prop({ type: String })
  tokenSymbol: string;

  @Prop({ type: Number })
  creatorAmount: number;

  @Prop({ type: Boolean })
  isBought: boolean;

  @Prop({ type: Number })
  sellSeconds: number;
}

export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order);