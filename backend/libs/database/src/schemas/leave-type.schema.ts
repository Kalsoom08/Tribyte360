import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeaveTypeDocument = LeaveType & Document;

@Schema({ timestamps: true })
export class LeaveType {
  @Prop({ required: true })
  name: string; // e.g., "Annual Leave", "Sick Leave", "Casual Leave"

  @Prop({ required: true, uppercase: true, trim: true })
  code: string; // e.g., "ANNUAL", "SICK", "CASUAL"

  @Prop({ required: true, default: 14 })
  defaultDaysPerYear: number;

  @Prop({ default: true })
  isPaid: boolean;

  @Prop({ default: true })
  allowCarryForward: boolean;

  @Prop({ default: 5 })
  maxCarryForwardDays: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const LeaveTypeSchema = SchemaFactory.createForClass(LeaveType);
