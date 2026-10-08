import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConnectionManagerService, CustomerInvoiceSchema, InvoiceStatus } from '@tribyte/common';

@Injectable()
export class AccInvoiceService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModel(tenantSlug: string) {
    return this.connectionManager.getTenantModel(tenantSlug, 'CustomerInvoice', CustomerInvoiceSchema);
  }

  async createInvoice(tenantSlug: string, data: any) {
    const InvoiceModel = await this.getModel(tenantSlug);

    const count = await InvoiceModel.countDocuments();
    const invoiceNumber = data.invoiceNumber || `INV-2026-${100 + count + 1}`;

    const items = (data.items || []).map((item: any) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.unitPrice || 0);
      return {
        description: item.description,
        quantity: qty,
        unitPrice: price,
        totalAmount: parseFloat((qty * price).toFixed(2)),
      };
    });

    const subtotal = items.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);
    const taxAmount = Number(data.taxAmount || 0);
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

    const invoice = await InvoiceModel.create({
      invoiceNumber: invoiceNumber.toUpperCase(),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      items,
      subtotal,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      status: InvoiceStatus.SENT,
      notes: data.notes,
    });

    return invoice;
  }

  async findAllInvoices(tenantSlug: string) {
    const InvoiceModel = await this.getModel(tenantSlug);

    const invoices = await InvoiceModel.find().sort({ createdAt: -1 });

    const totalReceivables = invoices.reduce((acc, curr) => acc + (curr.totalAmount - curr.amountPaid), 0);
    const totalCollected = invoices.reduce((acc, curr) => acc + curr.amountPaid, 0);

    return {
      stats: {
        totalInvoices: invoices.length,
        totalReceivables: parseFloat(totalReceivables.toFixed(2)),
        totalCollected: parseFloat(totalCollected.toFixed(2)),
      },
      invoices,
    };
  }

  async recordPayment(tenantSlug: string, invoiceId: string, amount: number) {
    const InvoiceModel = await this.getModel(tenantSlug);

    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Customer invoice not found');
    }

    invoice.amountPaid += Number(amount);
    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = InvoiceStatus.PAID;
    } else {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await invoice.save();
    return { message: 'Payment recorded successfully', invoice };
  }
}
