import { Controller, Post, Get, Body, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant, TenantUserAuthGuard, CurrentTenantUser } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { CreateAppraisalDto } from './dto/create-appraisal.dto';

@Controller('hr')
@UseGuards(TenantUserAuthGuard)
export class HrPerformanceGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  @Post('appraisals')
  async createAppraisal(
    @Body() dto: CreateAppraisalDto,
    @CurrentTenantUser() user: any,
    @CurrentTenant() tenantSlug: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    const reviewerUserId = user?.sub || user?.id || user?._id;

    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_APPRAISAL_CREATE, {
        tenantSlug,
        reviewerUserId,
        payload: dto,
        context: ctx,
      }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('appraisals')
  async findAllAppraisals(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_APPRAISAL_FIND_ALL, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('reports/summary')
  async getHrReportsSummary(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_REPORTS_SUMMARY, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }
}
