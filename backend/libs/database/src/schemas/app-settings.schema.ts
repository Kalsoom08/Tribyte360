import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppSettingsDocument = AppSettings & Document;

@Schema({ timestamps: true })
export class AppSettings {
  @Prop({ required: true, default: 'Tribyte360 ERP' })
  appName: string;

  @Prop({ required: true, default: 'en' })
  defaultLanguage: string;

  @Prop({ default: false })
  maintenanceMode: boolean;

  @Prop({ default: 'support@tribyte360.com' })
  supportEmail: string;

  @Prop({ default: 'https://tribyte360.com' })
  platformDomain: string;
}

export const AppSettingsSchema = SchemaFactory.createForClass(AppSettings);
