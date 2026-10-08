import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PayrollRecordDocument = PayrollRecord & Document;

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

@Schema({ _id: false })
export class PayrollItem {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) code: string;
  @Prop({ required: true }) amount: number;
  @Prop({ required: true }) type: string; // ALLOWANCE or DEDUCTION
}

@Schema({ timestamps: true })
export class PayrollRecord {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ required: true }) month: number; // 1 to 12
  @Prop({ required: true }) year: number; // e.g., 2026

  @Prop({ required: true, default: 0 }) baseSalary: number;
  @Prop({ type: [PayrollItem], default: [] }) allowances: PayrollItem[];
  @Prop({ type: [PayrollItem], default: [] }) deductions: PayrollItem[];

  @Prop({ default: 0 }) overtimePay: number;
  @Prop({ default: 0 }) bonusPay: number;

  @Prop({ required: true, default: 0 }) grossSalary: number;
  @Prop({ required: true, default: 0 }) netSalary: number;

  @Prop({ required: true, enum: PayrollStatus, default: PayrollStatus.DRAFT })
  status: PayrollStatus;

  @Prop() paidDate?: Date;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' }) approvedByUserId?: string;
}

export const PayrollRecordSchema = SchemaFactory.createForClass(PayrollRecord);
