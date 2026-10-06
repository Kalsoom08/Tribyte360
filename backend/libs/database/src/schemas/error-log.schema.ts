import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ErrorLogDocument = ErrorLog & Document;

@Schema({ timestamps: true })
export class ErrorLog {
  @Prop({ required: true, index: true })
  statusCode: number;

  @Prop({ required: true })
  errorCode: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  path?: string;

  @Prop()
  method?: string;

  @Prop()
  stackTrace?: string;

  @Prop({ index: true })
  correlationId?: string;

  @Prop()
  actorEmail?: string;
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);
