import { Controller, Post, Get, Patch, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant, TenantUserAuthGuard, CurrentTenantUser } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { CreateSupplierBillDto, CreateExpenseClaimDto, ApproveExpenseClaimDto } from './dto/create-payable.dto';

@Controller('accounting')
@UseGuards(TenantUserAuthGuard)
export class AccPayableGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  // Supplier Bills
  @Post('bills')
  async createBill(@Body() dto: CreateSupplierBillDto, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_BILL_CREATE, { tenantSlug, payload: dto, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('bills')
  async findAllBills(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_BILL_FIND_ALL, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  // Employee Expense Reimbursements
  @Post('expenses')
  async createExpenseClaim(@Body() dto: CreateExpenseClaimDto, @CurrentTenantUser() user: any, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const employeeUserId = user.sub || user.id;
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_EXPENSE_CLAIM_CREATE, { tenantSlug, employeeUserId, payload: dto, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('expenses')
  async findAllExpenseClaims(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_EXPENSE_CLAIM_FIND_ALL, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Patch('expenses/:id/approve')
  async approveExpenseClaim(
    @Param('id') id: string,
    @Body() dto: ApproveExpenseClaimDto,
    @CurrentTenantUser() user: any,
    @CurrentTenant() tenantSlug: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    const approverUserId = user.sub || user.id;
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_EXPENSE_CLAIM_APPROVE, {
        tenantSlug,
        claimId: id,
        approverUserId,
        status: dto.status,
        rejectionReason: dto.rejectionReason,
        context: ctx,
      }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }
}
