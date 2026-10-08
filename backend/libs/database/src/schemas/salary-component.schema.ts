import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SalaryComponentDocument = SalaryComponent & Document;

export enum ComponentType {
  ALLOWANCE = 'ALLOWANCE',
  DEDUCTION = 'DEDUCTION',
}

@Schema({ timestamps: true })
export class SalaryComponent {
  @Prop({ required: true })
  name: string; // e.g. "Housing Allowance", "Income Tax"

  @Prop({ required: true, uppercase: true, trim: true })
  code: string; // e.g. "HOUSING", "TAX_DEDUCTION"

  @Prop({ required: true, enum: ComponentType, default: ComponentType.ALLOWANCE })
  type: ComponentType;

  @Prop({ default: 0 })
  defaultAmount: number;

  @Prop({ default: true })
  isTaxable: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const SalaryComponentSchema = SchemaFactory.createForClass(SalaryComponent);
