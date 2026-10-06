import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SuperPermission } from './super-permission.schema';

export type SuperRoleDocument = SuperRole & Document;

@Schema({ timestamps: true })
export class SuperRole {
  @Prop({ required: true, unique: true })
  name: string; // e.g., 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT'

  @Prop()
  description?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'SuperPermission' }] })
  permissions: SuperPermission[];

  @Prop({ default: false })
  isSystemRole: boolean;
}

export const SuperRoleSchema = SchemaFactory.createForClass(SuperRole);
