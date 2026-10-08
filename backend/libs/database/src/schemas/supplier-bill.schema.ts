import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierBillDocument = SupplierBill & Document;

export enum BillStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

@Schema({ _id: false })
export class BillLineItem {
  @Prop({ required: true }) description: string;
  @Prop({ required: true, default: 1 }) quantity: number;
  @Prop({ required: true, default: 0 }) unitPrice: number;
  @Prop({ required: true, default: 0 }) totalAmount: number;
}

@Schema({ timestamps: true })
export class SupplierBill {
  @Prop({ required: true, unique: true, index: true, uppercase: true })
  billNumber: string; // e.g. "BILL-2026-001"

  @Prop({ required: true }) vendorName: string;
  @Prop() vendorEmail?: string;

  @Prop({ required: true, default: Date.now }) billDate: Date;
  @Prop({ required: true }) dueDate: Date;

  @Prop({ type: [BillLineItem], required: true }) items: BillLineItem[];

  @Prop({ required: true, default: 0 }) totalAmount: number;
  @Prop({ default: 0 }) amountPaid: number;

  @Prop({ required: true, enum: BillStatus, default: BillStatus.UNPAID })
  status: BillStatus;
}

export const SupplierBillSchema = SchemaFactory.createForClass(SupplierBill);
