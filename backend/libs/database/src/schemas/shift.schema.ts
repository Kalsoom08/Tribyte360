import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShiftDocument = Shift & Document;

@Schema({ timestamps: true })
export class Shift {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, default: '09:00' })
  startTime: string;

  @Prop({ required: true, default: '17:00' })
  endTime: string;

  @Prop({ default: 60 })
  breakDurationMinutes: number;

  @Prop({ default: 15 })
  gracePeriodMinutes: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);
