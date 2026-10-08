import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AttendanceLogDocument = AttendanceLog & Document;

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ABSENT = 'ABSENT',
  ON_LEAVE = 'ON_LEAVE',
}

@Schema({ timestamps: true })
export class AttendanceLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Shift' })
  shiftId?: string;

  @Prop({ required: true, index: true })
  date: string;

  @Prop() clockInTime?: Date;
  @Prop() clockOutTime?: Date;

  @Prop({ required: true, enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Prop({ default: 0 }) lateMinutes: number;
  @Prop({ default: 0 }) earlyExitMinutes: number;
  @Prop({ default: 0 }) overtimeHours: number;

  @Prop({ default: false }) isOvertimeApproved: boolean;
  @Prop() clockInIp?: string;
  @Prop() clockOutIp?: string;
}

export const AttendanceLogSchema = SchemaFactory.createForClass(AttendanceLog);
