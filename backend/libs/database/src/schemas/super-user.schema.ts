import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SuperRole } from './super-role.schema';

export type SuperUserDocument = SuperUser & Document;

export enum SuperUserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  SUSPENDED = 'SUSPENDED',
}

@Schema({ timestamps: true })
export class SuperUser {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'SuperRole' }] })
  roles: SuperRole[];

  @Prop({ required: true, enum: SuperUserStatus, default: SuperUserStatus.ACTIVE })
  status: SuperUserStatus;

  @Prop()
  phone?: string;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop()
  twoFactorSecret?: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  lastLoginIp?: string;
}

export const SuperUserSchema = SchemaFactory.createForClass(SuperUser);
