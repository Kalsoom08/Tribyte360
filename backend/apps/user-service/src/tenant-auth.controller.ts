import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, AppLoggerService } from '@tribyte/common';
import { TenantAuthService } from './tenant-auth.service';

@Controller()
export class TenantAuthMessageController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly tenantAuthService: TenantAuthService,
  ) {
    this.logger.setServiceName('user-service');
  }

  @MessagePattern(MessagePatterns.TENANT_AUTH_LOGIN)
  async handleTenantLogin(@Payload() data: { tenantSlug: string; payload: any; context: any }) {
    this.logger.log(`Processing tenant login for '${data.tenantSlug}'`, 'TenantAuthController', data.context);
    return this.tenantAuthService.login(data.tenantSlug, data.payload.email, data.payload.password);
  }
}
