import { Controller, Post, Get, Body, Query, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant, TenantUserAuthGuard, CurrentTenantUser } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { PostPayrollJournalDto } from './dto/post-payroll.dto';

@Controller('accounting/payroll')
@UseGuards(TenantUserAuthGuard)
export class AccPayrollPostingGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  @Post('post-journal')
  async postPayrollJournal(
    @Body() dto: PostPayrollJournalDto,
    @CurrentTenantUser() user: any,
    @CurrentTenant() tenantSlug: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    const postedByUserId = user.sub || user.id;
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_PAYROLL_POST_JOURNAL, { tenantSlug, month: dto.month, year: dto.year, postedByUserId, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('export-bank-file')
  async exportBankFile(
    @Query('month') month: number,
    @Query('year') year: number,
    @CurrentTenant() tenantSlug: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_PAYROLL_EXPORT_BANK_FILE, { tenantSlug, month: Number(month), year: Number(year), context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }
}
