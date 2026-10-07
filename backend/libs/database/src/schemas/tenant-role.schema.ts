import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantRoleDocument = TenantRole & Document;

@Schema({ timestamps: true })
export class TenantRole {
  @Prop({ required: true })
  name: string; // e.g. "HR_MANAGER", "ACCOUNTANT", "LINE_MANAGER", "EMPLOYEE"

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  permissions: string[]; // e.g. ["hr.employees.read", "hr.leaves.approve"]

  @Prop({ default: false })
  isSystemRole: boolean;
}

export const TenantRoleSchema = SchemaFactory.createForClass(TenantRole);
