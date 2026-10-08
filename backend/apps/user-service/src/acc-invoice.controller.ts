import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { AccInvoiceService } from './acc-invoice.service';

@Controller()
export class AccInvoiceMessageController {
  constructor(private readonly invoiceService: AccInvoiceService) {}

  @MessagePattern(MessagePatterns.ACC_INVOICE_CREATE)
  async handleCreateInvoice(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.invoiceService.createInvoice(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.ACC_INVOICE_FIND_ALL)
  async handleFindInvoices(@Payload() data: { tenantSlug: string }) {
    return this.invoiceService.findAllInvoices(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.ACC_INVOICE_RECORD_PAYMENT)
  async handleRecordPayment(@Payload() data: { tenantSlug: string; invoiceId: string; amount: number }) {
    return this.invoiceService.recordPayment(data.tenantSlug, data.invoiceId, data.amount);
  }
}
