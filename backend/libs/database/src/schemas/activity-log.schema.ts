import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document;

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ required: true, index: true })
  actorEmail: string; // Who performed the action

  @Prop({ required: true })
  action: string; // e.g. "CREATE", "UPDATE", "DELETE", "LOGIN", "BLOCK"

  @Prop({ required: true, index: true })
  module: string; // e.g. "TENANT_MANAGEMENT", "SUPER_AUTH", "CATALOG"

  @Prop({ required: true, index: true })
  entityType: string; // e.g. "TENANT", "USER", "ROLE", "PLAN"

  @Prop({ index: true })
  entityId?: string; // Primary key of affected record

  @Prop({ required: true })
  description: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  correlationId?: string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
