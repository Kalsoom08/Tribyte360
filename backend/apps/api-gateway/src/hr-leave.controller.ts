import { Controller, Post, Get, Patch, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant, TenantUserAuthGuard, CurrentTenantUser } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { CreateLeaveTypeDto, CreateLeaveRequestDto, UpdateLeaveRequestStatusDto } from './dto/create-leave.dto';

@Controller('hr')
@UseGuards(TenantUserAuthGuard)
export class HrLeaveGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  // Leave Types
  @Post('leave-types')
  async createLeaveType(@Body() dto: CreateLeaveTypeDto, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_LEAVE_TYPE_CREATE, { tenantSlug, payload: dto, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('leave-types')
  async findAllLeaveTypes(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_LEAVE_TYPE_FIND_ALL, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  // Leave Requests
  @Post('leave-requests')
  async createLeaveRequest(@Body() dto: CreateLeaveRequestDto, @CurrentTenantUser() user: any, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_LEAVE_REQUEST_CREATE, { tenantSlug, userId: user.sub, payload: dto, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('leave-requests')
  async findAllLeaveRequests(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_LEAVE_REQUEST_FIND_ALL, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Patch('leave-requests/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestStatusDto,
    @CurrentTenantUser() user: any,
    @CurrentTenant() tenantSlug: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_LEAVE_REQUEST_UPDATE_STATUS, {
        tenantSlug,
        requestId: id,
        approverUserId: user.sub,
        status: dto.status,
        rejectionReason: dto.rejectionReason,
        context: ctx,
      }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }
}
