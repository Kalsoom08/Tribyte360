import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, AppLoggerService } from '@tribyte/common';
import { CatalogService } from './catalog.service';

@Controller()
export class CatalogMessageController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly catalogService: CatalogService,
  ) {
    this.logger.setServiceName('auth-service');
  }

  @MessagePattern(MessagePatterns.MODULE_CREATE)
  async handleCreateModule(@Payload() data: { payload: any; context: any }) {
    this.logger.log('Creating new catalog module', 'CatalogController', data.context);
    return this.catalogService.createModule(data.payload);
  }

  @MessagePattern(MessagePatterns.MODULE_FIND_ALL)
  async handleFindAllModules(@Payload() data: { context: any }) {
    return this.catalogService.findAllModules();
  }

  @MessagePattern(MessagePatterns.PLAN_CREATE)
  async handleCreatePlan(@Payload() data: { payload: any; context: any }) {
    this.logger.log('Creating new subscription plan', 'CatalogController', data.context);
    return this.catalogService.createPlan(data.payload);
  }

  @MessagePattern(MessagePatterns.PLAN_FIND_ALL)
  async handleFindAllPlans(@Payload() data: { context: any }) {
    return this.catalogService.findAllPlans();
  }

  @MessagePattern(MessagePatterns.TENANT_ASSIGN_MODULES)
  async handleAssignModules(@Payload() data: { tenantId: string; installedApps: string[]; context: any }) {
    this.logger.log(`Assigning modules to tenant ${data.tenantId}`, 'CatalogController', data.context);
    return this.catalogService.assignTenantModules(data.tenantId, data.installedApps);
  }
}
