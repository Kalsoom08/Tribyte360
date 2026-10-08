import { Controller, Post, Get, Body, Query, Inject, UseGuards, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant, TenantUserAuthGuard, CurrentTenantUser } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { CreateShiftDto } from './dto/create-shift.dto';

@Controller('hr')
@UseGuards(TenantUserAuthGuard)
export class HrAttendanceGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  @Post('shifts')
  async createShift(@Body() dto: CreateShiftDto, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_SHIFT_CREATE, { tenantSlug, payload: dto, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('shifts')
  async findAllShifts(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_SHIFT_FIND_ALL, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Post('attendance/clock-in')
  async clockIn(@CurrentTenantUser() user: any, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext, @Req() req: any): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_ATTENDANCE_CLOCK_IN, { tenantSlug, userId: user.sub, ipAddress: req.ip, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Post('attendance/clock-out')
  async clockOut(@CurrentTenantUser() user: any, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext, @Req() req: any): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_ATTENDANCE_CLOCK_OUT, { tenantSlug, userId: user.sub, ipAddress: req.ip, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('attendance')
  async findAllAttendance(@Query('date') date: string, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.HR_ATTENDANCE_FIND_ALL, { tenantSlug, date, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }
}
