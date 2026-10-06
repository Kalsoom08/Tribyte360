import { Controller, Post, Get, Patch, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, SuperAuthGuard, RequirePermissions, PermissionsGuard } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { AssignTenantModulesDto } from './dto/assign-tenant-modules.dto';

@Controller('admin')
@UseGuards(SuperAuthGuard, PermissionsGuard)
export class CatalogGatewayController {
  constructor(@Inject(QueueNames.TENANT_QUEUE) private readonly tenantClient: ClientProxy) {}

  // Modules
  @Get('modules')
  @RequirePermissions('tenants.read')
  async findAllModules(@ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.MODULE_FIND_ALL, { context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('modules')
  @RequirePermissions('modules.manage')
  async createModule(@Body() dto: CreateModuleDto, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.MODULE_CREATE, { payload: dto, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  // Subscription Plans
  @Get('plans')
  @RequirePermissions('tenants.read')
  async findAllPlans(@ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.PLAN_FIND_ALL, { context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('plans')
  @RequirePermissions('modules.manage')
  async createPlan(@Body() dto: CreatePlanDto, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.PLAN_CREATE, { payload: dto, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  // Tenant Module Assignment
  @Patch('tenants/:id/modules')
  @RequirePermissions('tenants.update')
  async assignTenantModules(
    @Param('id') id: string,
    @Body() dto: AssignTenantModulesDto,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.tenantClient.send(MessagePatterns.TENANT_ASSIGN_MODULES, { tenantId: id, installedApps: dto.installedApps, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }
}
