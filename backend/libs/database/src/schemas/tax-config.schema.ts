import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaxConfigDocument = TaxConfig & Document;

@Schema({ timestamps: true })
export class TaxConfig {
  @Prop({ required: true })
  name: string; // e.g. "Standard Sales VAT", "Withholding Tax"

  @Prop({ required: true, uppercase: true, trim: true })
  code: string; // e.g. "VAT_10", "WHT_5"

  @Prop({ required: true, default: 0 })
  ratePercentage: number; // e.g. 10 for 10%

  @Prop({ default: false })
  isWithholding: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const TaxConfigSchema = SchemaFactory.createForClass(TaxConfig);
