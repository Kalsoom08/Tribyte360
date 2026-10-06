import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, AppLoggerService } from '@tribyte/common';
import { SuperUserService } from './super-user.service';
import { LogsService } from './logs.service';

@Controller()
export class SuperUserMessageController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly superUserService: SuperUserService,
    private readonly logsService: LogsService,
  ) {
    this.logger.setServiceName('auth-service');
  }

  @MessagePattern(MessagePatterns.SUPER_USER_CREATE)
  async handleCreateSuperUser(@Payload() data: { payload: any; context: any }) {
    this.logger.log('Creating new internal super admin user', 'SuperUserController', data.context);
    const result = await this.superUserService.createSuperUser(data.payload);

    // Audit Log
    await this.logsService.recordActivity({
      actorEmail: data.context?.userEmail || 'admin@tribyte360.com',
      action: 'CREATE',
      module: 'SUPER_AUTH',
      entityType: 'USER',
      entityId: result.id.toString(),
      description: `Created internal user: ${result.email}`,
      correlationId: data.context?.correlationId,
    });

    return result;
  }

  @MessagePattern(MessagePatterns.SUPER_USER_FIND_ALL)
  async handleFindAllSuperUsers() {
    return this.superUserService.findAllSuperUsers();
  }
}
