import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CostCenterDocument = CostCenter & Document;

@Schema({ timestamps: true })
export class CostCenter {
  @Prop({ required: true })
  name: string; // e.g. "Engineering R&D", "Marketing Campaigns"

  @Prop({ required: true, uppercase: true, trim: true })
  code: string; // e.g. "CC-101", "CC-202"

  @Prop({ default: 0 })
  budgetAllocation: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CostCenterSchema = SchemaFactory.createForClass(CostCenter);
