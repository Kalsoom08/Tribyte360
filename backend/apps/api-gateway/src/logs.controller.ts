import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { ReqContext, SuperAuthGuard, RequirePermissions, PermissionsGuard } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';

@Controller('admin/logs')
@UseGuards(SuperAuthGuard, PermissionsGuard)
export class LogsGatewayController {
  constructor(@Inject(QueueNames.TENANT_QUEUE) private readonly tenantClient: ClientProxy) {}

  @Get('activity')
  @RequirePermissions('logs.read')
  async getActivityLogs(@Query() query: any, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.LOGS_FIND_ACTIVITY, { filter: query, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('errors')
  @RequirePermissions('logs.read')
  async getErrorLogs(@ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.LOGS_FIND_ERROR, { context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }
}
