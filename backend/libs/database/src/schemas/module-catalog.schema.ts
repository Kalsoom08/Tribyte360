import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ModuleCatalogDocument = ModuleCatalog & Document;

@Schema({ timestamps: true })
export class ModuleCatalog {
  @Prop({ required: true })
  name: string; // e.g. "Human Resources", "Attendance App"

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string; // e.g. "HR", "ATTENDANCE", "ACCOUNTING", "AMS"

  @Prop()
  description?: string;

  @Prop({ default: '1.0.0' })
  version: string;

  @Prop({ default: false })
  isDefault: boolean; // Automatically assigned to new tenants if true

  @Prop({ default: true })
  isActive: boolean;
}

export const ModuleCatalogSchema = SchemaFactory.createForClass(ModuleCatalog);
