import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type JournalEntryDocument = JournalEntry & Document;

export enum JournalSource {
  MANUAL = 'MANUAL',
  PAYROLL = 'PAYROLL',
  INVOICE = 'INVOICE',
  EXPENSE = 'EXPENSE',
}

@Schema({ _id: false })
export class JournalLine {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'GlAccount', required: true })
  glAccountId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 }) debit: number;
  @Prop({ default: 0 }) credit: number;
  @Prop() description?: string;
}

@Schema({ timestamps: true })
export class JournalEntry {
  @Prop({ required: true, unique: true, index: true, uppercase: true })
  entryNumber: string;

  @Prop({ required: true, default: Date.now })
  entryDate: Date;

  @Prop({ required: true })
  description: string;

  @Prop()
  reference?: string;

  @Prop({ required: true, enum: JournalSource, default: JournalSource.MANUAL })
  source: JournalSource;

  @Prop({ type: [JournalLine], required: true })
  lines: JournalLine[];

  @Prop({ required: true, default: 0 })
  totalDebit: number;

  @Prop({ required: true, default: 0 })
  totalCredit: number;

  @Prop({ default: 'POSTED' })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  postedByUserId?: MongooseSchema.Types.ObjectId;
}

export const JournalEntrySchema = SchemaFactory.createForClass(JournalEntry);
