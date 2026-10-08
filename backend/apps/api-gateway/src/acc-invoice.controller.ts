import { Controller, Post, Get, Patch, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant, TenantUserAuthGuard } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { CreateCustomerInvoiceDto, RecordInvoicePaymentDto } from './dto/create-invoice.dto';

@Controller('accounting/invoices')
@UseGuards(TenantUserAuthGuard)
export class AccInvoiceGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  @Post()
  async createInvoice(@Body() dto: CreateCustomerInvoiceDto, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_INVOICE_CREATE, { tenantSlug, payload: dto, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get()
  async findAllInvoices(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_INVOICE_FIND_ALL, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Patch(':id/pay')
  async recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordInvoicePaymentDto,
    @CurrentTenant() tenantSlug: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_INVOICE_RECORD_PAYMENT, { tenantSlug, invoiceId: id, amount: dto.amount, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }
}
