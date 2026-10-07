import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyAuditSettingsDocument = CompanyAuditSettings & Document;

@Schema({ timestamps: true })
export class CompanyAuditSettings {
  @Prop({ default: true })
  logDataExports: boolean;

  @Prop({ default: true })
  logDocumentDownloads: boolean;

  @Prop({ default: true })
  enableDocumentRetention: boolean;

  @Prop({ default: 36 }) // 3 years retention by default
  retentionPeriodMonths: number;

  @Prop({ default: false })
  restrictIpAccess: boolean;

  @Prop({ type: [String], default: [] })
  allowedIpList: string[];
}

export const CompanyAuditSettingsSchema = SchemaFactory.createForClass(CompanyAuditSettings);
