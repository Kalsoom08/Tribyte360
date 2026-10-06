import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name: string; // e.g. "Devsinc Solutions"

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  slug: string; // Subdomain e.g. "devsinc"

  @Prop({ required: true, lowercase: true, trim: true })
  ownerEmail: string;

  @Prop()
  phone?: string;

  @Prop({ default: 'United States' })
  country?: string;

  @Prop({ default: 'UTC' })
  timezone?: string;

  @Prop({ required: true, enum: TenantStatus, default: TenantStatus.TRIAL })
  status: TenantStatus;

  @Prop({ type: [String], default: ['HR', 'ACCOUNTING'] })
  installedApps: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
