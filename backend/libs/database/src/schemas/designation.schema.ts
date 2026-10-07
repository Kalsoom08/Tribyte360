import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DesignationDocument = Designation & Document;

@Schema({ timestamps: true })
export class Designation {
  @Prop({ required: true })
  title: string; // e.g. "Senior Software Engineer", "HR Manager"

  @Prop({ required: true, uppercase: true, trim: true })
  code: string; // e.g. "SR_ENG", "HR_MGR"

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department' })
  departmentId?: string;

  @Prop({ default: 1 })
  level: number; // Job tier level (1, 2, 3...)

  @Prop({ default: true })
  isActive: boolean;
}

export const DesignationSchema = SchemaFactory.createForClass(Designation);
