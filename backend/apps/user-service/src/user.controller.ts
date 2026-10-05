import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, AppLoggerService, ConnectionManagerService, I18nService } from '@tribyte/common';

@Controller()
export class UserMessageController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly connectionManager: ConnectionManagerService,
    private readonly i18n: I18nService,
  ) {
    this.logger.setServiceName('user-service');
  }

  @MessagePattern(MessagePatterns.USER_FIND_ALL)
  async handleFindAll(@Payload() data: { tenantId?: string; context: any }) {
    const tenant = data.tenantId || 'default';
    this.logger.log(`Acquiring connection pool for tenant: ${tenant}`, 'UserService', data.context);
    
    // Acquires or retrieves cached isolated MongoDB connection for the tenant
    const tenantDb = await this.connectionManager.getTenantDatabaseConnection(tenant);

    return {
      tenantDatabase: tenantDb.name,
      users: [
        { id: 'usr_01', name: 'Alice Developer', tenant },
        { id: 'usr_02', name: 'Bob Engineer', tenant },
      ],
      localizedMessage: this.i18n.translate('welcome', data.context?.language),
    };
  }

  @MessagePattern(MessagePatterns.USER_GET_BY_ID)
  async handleGetById(@Payload() data: { id: string; tenantId?: string; context: any }) {
    const tenant = data.tenantId || 'default';
    this.logger.log(`Fetching user ${data.id} in tenant: ${tenant}`, 'UserService', data.context);

    return {
      id: data.id,
      name: 'Alice Developer',
      tenant,
      status: 'ACTIVE',
    };
  }
}
