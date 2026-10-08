import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmployeeDocumentItem {
  @Prop({ type: String, required: true })
  docType: string; // e.g. "PASSPORT", "VISA", "NATIONAL_ID"

  @Prop({ type: String, required: true })
  documentNumber: string;

  @Prop() documentUrl?: string;
  @Prop() issueDate?: Date;
  @Prop() expiryDate?: Date;
}

export const EmployeeDocumentItemSchema = SchemaFactory.createForClass(EmployeeDocumentItem);
