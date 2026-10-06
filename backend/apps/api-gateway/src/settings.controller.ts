import { Controller, Get, Patch, Body, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, SuperAuthGuard, RequirePermissions, PermissionsGuard } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('admin/settings')
@UseGuards(SuperAuthGuard, PermissionsGuard)
export class SettingsGatewayController {
  constructor(@Inject(QueueNames.TENANT_QUEUE) private readonly tenantClient: ClientProxy) {}

  @Get()
  @RequirePermissions('settings.manage')
  async getSettings(@ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.SETTINGS_GET, { context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch()
  @RequirePermissions('settings.manage')
  async updateSettings(@Body() dto: UpdateSettingsDto, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.SETTINGS_UPDATE, { updateData: dto, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }
}
