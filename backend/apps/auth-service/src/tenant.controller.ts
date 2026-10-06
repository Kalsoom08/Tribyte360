import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, AppLoggerService } from '@tribyte/common';
import { TenantService } from './tenant.service';

@Controller()
export class TenantMessageController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly tenantService: TenantService,
  ) {
    this.logger.setServiceName('auth-service');
  }

  @MessagePattern(MessagePatterns.TENANT_CREATE)
  async handleCreate(@Payload() data: { payload: any; context: any }) {
    this.logger.log('Creating new tenant & provisioning database', 'TenantController', data.context);
    return this.tenantService.createTenant(data.payload);
  }

  @MessagePattern(MessagePatterns.TENANT_FIND_ALL)
  async handleFindAll(@Payload() data: { context: any }) {
    this.logger.log('Fetching all tenants and statistics', 'TenantController', data.context);
    return this.tenantService.findAllTenants();
  }

  @MessagePattern(MessagePatterns.TENANT_GET_BY_ID)
  async handleGetById(@Payload() data: { id: string; context: any }) {
    return this.tenantService.findTenantById(data.id);
  }

  @MessagePattern(MessagePatterns.TENANT_UPDATE_STATUS)
  async handleUpdateStatus(@Payload() data: { id: string; status: any; context: any }) {
    return this.tenantService.updateTenantStatus(data.id, data.status);
  }

  @MessagePattern(MessagePatterns.TENANT_DELETE)
  async handleDelete(@Payload() data: { id: string; context: any }) {
    return this.tenantService.deleteTenant(data.id);
  }

  @MessagePattern(MessagePatterns.TENANT_RESET_ADMIN_PASSWORD)
  async handleResetPassword(@Payload() data: { id: string; context: any }) {
    return this.tenantService.resetTenantAdminPassword(data.id);
  }

  @MessagePattern(MessagePatterns.TENANT_BLOCK_ADMIN)
  async handleBlockAdmin(@Payload() data: { id: string; isBlocked: boolean; context: any }) {
    return this.tenantService.blockTenantAdmin(data.id, data.isBlocked);
  }
}
