import { Controller, Post, Get, Body, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, SuperAuthGuard, RequirePermissions, PermissionsGuard } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { CreateSuperUserDto } from './dto/create-super-user.dto';

@Controller('admin/users')
@UseGuards(SuperAuthGuard, PermissionsGuard)
export class SuperUserGatewayController {
  constructor(@Inject(QueueNames.TENANT_QUEUE) private readonly tenantClient: ClientProxy) {}

  @Post()
  @RequirePermissions('users.manage')
  async createSuperUser(@Body() dto: CreateSuperUserDto, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.SUPER_USER_CREATE, { payload: dto, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @RequirePermissions('users.manage')
  async findAllSuperUsers(@ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.SUPER_USER_FIND_ALL, { context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }
}
