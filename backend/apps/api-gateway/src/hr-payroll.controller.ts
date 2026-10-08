import { Controller, Post, Get, Patch, Body, Query, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant, TenantUserAuthGuard, CurrentTenantUser } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { CreateSalaryComponentDto, GeneratePayrollDto } from './dto/create-payroll.dto';

@Controller('hr/payroll')
@UseGuards(TenantUserAuthGuard)
export class HrPayrollGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  // Salary Components
  @Post('components')
  async createComponent(@Body() dto: CreateSalaryComponentDto, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_SALARY_COMPONENT_CREATE, { tenantSlug, payload: dto, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('components')
  async findAllComponents(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_SALARY_COMPONENT_FIND_ALL, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  // Monthly Payroll Generation & Approval
  @Post('generate')
  async generateMonthlyPayroll(@Body() dto: GeneratePayrollDto, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_PAYROLL_GENERATE_MONTHLY, { tenantSlug, month: dto.month, year: dto.year, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get()
  async findAllPayrolls(@Query('month') month: number, @Query('year') year: number, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_PAYROLL_FIND_ALL, { tenantSlug, month, year, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Patch('approve')
  async approvePayroll(@Body() dto: GeneratePayrollDto, @CurrentTenantUser() user: any, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_PAYROLL_APPROVE, { tenantSlug, month: dto.month, year: dto.year, approverUserId: user.sub, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }
}
