import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ExpenseClaimDocument = ExpenseClaim & Document;

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REIMBURSED = 'REIMBURSED',
}

@Schema({ timestamps: true })
export class ExpenseClaim {
  @Prop({ required: true, unique: true, index: true, uppercase: true })
  claimNumber: string; // e.g. "EXP-1001"

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  employeeUserId: string;

  @Prop({ required: true, default: 'OFFICE_SUPPLIES' })
  category: string; // e.g. "TRAVEL", "MEALS", "OFFICE_SUPPLIES", "CLIENT_ENTERTAINMENT"

  @Prop({ required: true, default: 0 })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop()
  receiptUrl?: string;

  @Prop({ required: true, enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  status: ExpenseStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedByUserId?: string;

  @Prop()
  rejectionReason?: string;
}

export const ExpenseClaimSchema = SchemaFactory.createForClass(ExpenseClaim);
