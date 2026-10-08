import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmployeeDocumentItem {
  @Prop({ required: true }) type: string; // e.g., "PASSPORT", "VISA", "NATIONAL_ID", "CERTIFICATE"
  @Prop({ required: true }) documentNumber: string;
  @Prop() documentUrl?: string;
  @Prop() issueDate?: Date;
  @Prop() expiryDate?: Date;
}

export const EmployeeDocumentItemSchema = SchemaFactory.createForClass(EmployeeDocumentItem);
