import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmploymentContractDocument = EmploymentContract & Document;

export enum ContractType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

@Schema({ timestamps: true })
export class EmploymentContract {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true, enum: ContractType, default: ContractType.FULL_TIME })
  contractType: ContractType;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: 90 }) // Probation in days
  probationDays: number;

  @Prop({ default: 30 }) // Notice period in days
  noticePeriodDays: number;

  @Prop({ required: true, default: 0 })
  baseSalary: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const EmploymentContractSchema = SchemaFactory.createForClass(EmploymentContract);
