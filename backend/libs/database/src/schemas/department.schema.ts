import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true })
  name: string; // e.g. "Engineering", "Human Resources"

  @Prop({ required: true, uppercase: true, trim: true })
  code: string; // e.g. "ENG", "HR"

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', default: null })
  parentDepartmentId?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
