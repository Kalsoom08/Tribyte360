import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SuperPermissionDocument = SuperPermission & Document;

@Schema({ timestamps: true })
export class SuperPermission {
  @Prop({ required: true, unique: true, index: true })
  slug: string; // e.g., 'tenants.create', 'users.delete'

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  module: string; // e.g., 'TENANT_MANAGEMENT', 'SUPER_AUTH'

  @Prop()
  description?: string;
}

export const SuperPermissionSchema = SchemaFactory.createForClass(SuperPermission);
