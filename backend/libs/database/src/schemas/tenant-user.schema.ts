import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TenantUserDocument = TenantUser & Document;

@Schema({ timestamps: true })
export class TenantUser {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: 'EMPLOYEE' })
  role: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TenantRole' })
  roleId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department' })
  departmentId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Designation' })
  designationId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Branch' })
  branchId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CostCenter' })
  costCenterId?: string;

  @Prop({ default: 'ACTIVE' })
  status: string;

  @Prop()
  phone?: string;
}

export const TenantUserSchema = SchemaFactory.createForClass(TenantUser);
