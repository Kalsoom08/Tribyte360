import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerInvoiceDocument = CustomerInvoice & Document;

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

@Schema({ _id: false })
export class InvoiceLineItem {
  @Prop({ required: true }) description: string;
  @Prop({ required: true, default: 1 }) quantity: number;
  @Prop({ required: true, default: 0 }) unitPrice: number;
  @Prop({ required: true, default: 0 }) totalAmount: number;
}

@Schema({ timestamps: true })
export class CustomerInvoice {
  @Prop({ required: true, unique: true, index: true, uppercase: true })
  invoiceNumber: string; // e.g. "INV-2026-001"

  @Prop({ required: true }) customerName: string;
  @Prop({ required: true }) customerEmail: string;

  @Prop({ required: true, default: Date.now }) invoiceDate: Date;
  @Prop({ required: true }) dueDate: Date;

  @Prop({ type: [InvoiceLineItem], required: true }) items: InvoiceLineItem[];

  @Prop({ required: true, default: 0 }) subtotal: number;
  @Prop({ default: 0 }) taxAmount: number;
  @Prop({ required: true, default: 0 }) totalAmount: number;
  @Prop({ default: 0 }) amountPaid: number;

  @Prop({ required: true, enum: InvoiceStatus, default: InvoiceStatus.SENT })
  status: InvoiceStatus;

  @Prop() notes?: string;
}

export const CustomerInvoiceSchema = SchemaFactory.createForClass(CustomerInvoice);
