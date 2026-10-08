import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PerformanceAppraisalDocument = PerformanceAppraisal & Document;

@Schema({ timestamps: true })
export class PerformanceAppraisal {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reviewerUserId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  cycleName: string;

  @Prop({ type: [Object], default: [] })
  kpis: Record<string, any>[];

  @Prop({ required: true, default: 5 })
  overallRating: number;

  @Prop()
  feedback?: string;

  @Prop({ default: false })
  promotionRecommended: boolean;

  @Prop({ default: 0 })
  salaryIncrementAmount: number;

  @Prop({ default: 'COMPLETED' })
  status: string;
}

export const PerformanceAppraisalSchema = SchemaFactory.createForClass(PerformanceAppraisal);
