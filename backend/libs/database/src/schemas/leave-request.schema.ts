import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LeaveRequestDocument = LeaveRequest & Document;

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class LeaveRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, default: 1 })
  totalDays: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, enum: LeaveRequestStatus, default: LeaveRequestStatus.PENDING })
  status: LeaveRequestStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedByUserId?: string;

  @Prop()
  rejectionReason?: string;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
