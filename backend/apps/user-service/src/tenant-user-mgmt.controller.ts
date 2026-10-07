import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { TenantUserMgmtService } from './tenant-user-mgmt.service';

@Controller()
export class TenantUserMgmtMessageController {
  constructor(private readonly userMgmtService: TenantUserMgmtService) {}

  @MessagePattern(MessagePatterns.TENANT_ROLE_CREATE)
  async handleCreateRole(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.userMgmtService.createRole(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.TENANT_ROLE_FIND_ALL)
  async handleFindRoles(@Payload() data: { tenantSlug: string }) {
    return this.userMgmtService.findAllRoles(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.TENANT_USER_CREATE)
  async handleCreateUser(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.userMgmtService.createUser(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.TENANT_USER_FIND_ALL)
  async handleFindUsers(@Payload() data: { tenantSlug: string }) {
    return this.userMgmtService.findAllUsers(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.TENANT_USER_GET_BY_ID)
  async handleGetUserById(@Payload() data: { tenantSlug: string; id: string }) {
    return this.userMgmtService.findUserById(data.tenantSlug, data.id);
  }
}
