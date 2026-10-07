import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BranchDocument = Branch & Document;

@Schema({ timestamps: true })
export class Branch {
  @Prop({ required: true })
  name: string; // e.g. "Austin Tech Center", "London HQ"

  @Prop({ required: true, uppercase: true, trim: true })
  code: string; // e.g. "ATX_01", "LDN_HQ"

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: false })
  isHeadquarters: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
