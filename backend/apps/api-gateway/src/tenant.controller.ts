import { Controller, Post, Get, Patch, Delete, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, SuperAuthGuard, RequirePermissions, PermissionsGuard } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { BlockTenantAdminDto } from './dto/block-tenant-admin.dto';

@Controller('admin/tenants')
@UseGuards(SuperAuthGuard, PermissionsGuard)
export class TenantGatewayController {
  constructor(@Inject(QueueNames.TENANT_QUEUE) private readonly tenantClient: ClientProxy) {}

  @Post()
  @RequirePermissions('tenants.create')
  async create(@Body() dto: CreateTenantDto, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.TENANT_CREATE, { payload: dto, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @RequirePermissions('tenants.read')
  async findAll(@ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.TENANT_FIND_ALL, { context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @RequirePermissions('tenants.read')
  async findOne(@Param('id') id: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.TENANT_GET_BY_ID, { id, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/status')
  @RequirePermissions('tenants.update')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.TENANT_UPDATE_STATUS, { id, status: dto.status, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/reset-admin-password')
  @RequirePermissions('tenants.update')
  async resetAdminPassword(@Param('id') id: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.TENANT_RESET_ADMIN_PASSWORD, { id, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/block-admin')
  @RequirePermissions('tenants.update')
  async blockAdmin(
    @Param('id') id: string,
    @Body() dto: BlockTenantAdminDto,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.TENANT_BLOCK_ADMIN, { id, isBlocked: dto.isBlocked, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @RequirePermissions('tenants.delete')
  async delete(@Param('id') id: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.TENANT_DELETE, { id, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }
}
