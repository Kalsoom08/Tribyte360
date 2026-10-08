import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { EmployeeDocumentItem, EmployeeDocumentItemSchema } from './employee-document.schema';

export type EmployeeProfileDocument = EmployeeProfile & Document;

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED',
  ON_LEAVE = 'ON_LEAVE',
}

@Schema({ timestamps: true })
export class EmployeeProfile {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  employeeCode: string; // e.g., "EMP-1001"

  @Prop() dateOfBirth?: Date;
  @Prop() gender?: string;
  @Prop() maritalStatus?: string;
  @Prop() nationality?: string;

  @Prop({ required: true, enum: EmploymentStatus, default: EmploymentStatus.ACTIVE })
  status: EmploymentStatus;

  @Prop({ required: true, default: Date.now })
  joiningDate: Date;

  @Prop()
  exitDate?: Date;

  @Prop()
  exitReason?: string;

  @Prop({ type: [EmployeeDocumentItemSchema], default: [] })
  documents: EmployeeDocumentItem[];

  @Prop() emergencyContactName?: string;
  @Prop() emergencyContactPhone?: string;
  @Prop() emergencyContactRelation?: string;
}

export const EmployeeProfileSchema = SchemaFactory.createForClass(EmployeeProfile);
