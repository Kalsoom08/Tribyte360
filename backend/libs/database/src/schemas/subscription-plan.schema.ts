import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document;

@Schema({ timestamps: true })
export class SubscriptionPlan {
  @Prop({ required: true })
  name: string; // e.g. "Free Tier", "Pro Enterprise"

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string; // e.g. "FREE", "BASIC", "PRO"

  @Prop({ required: true, default: 10 })
  maxUsers: number;

  @Prop({ type: [String], required: true })
  allowedModules: string[]; // Codes e.g. ["HR", "ATTENDANCE"]

  @Prop({ default: 0 })
  priceMonthly: number;

  @Prop({ default: 14 })
  trialDays: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);
