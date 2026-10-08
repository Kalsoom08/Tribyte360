import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type GlAccountDocument = GlAccount & Document;

export enum AccountCategory {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

@Schema({ timestamps: true })
export class GlAccount {
  @Prop({ required: true, uppercase: true, trim: true, index: true })
  code: string; // e.g. "1010", "2010", "4010", "5010"

  @Prop({ required: true })
  name: string; // e.g. "Cash at Bank", "Accounts Payable", "Salaries Expense"

  @Prop({ required: true, enum: AccountCategory })
  category: AccountCategory;

  @Prop({ default: 0 })
  currentBalance: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CostCenter' })
  costCenterId?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const GlAccountSchema = SchemaFactory.createForClass(GlAccount);
