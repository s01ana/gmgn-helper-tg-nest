import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Setting {
  @Prop({ type: Number })
  chatId: number;

  @Prop({ type: String })
  userName: string;

  @Prop({ type: Number })
  devSellRate: number;

  @Prop({ type: Number })
  buyAmount: number;

  @Prop({ type: Number })
  fee: number;

  @Prop({ type: Boolean })
  autoSell: boolean;

  @Prop({ type: Number })
  sellTime: number;

  @Prop({ type: String })
  key: string;

  @Prop({ type: Number })
  slippage: number;
}

export type SettingDocument = Setting & Document;
export const SettingSchema = SchemaFactory.createForClass(Setting);