import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, AppLoggerService } from '@tribyte/common';
import { CompanyProfileService } from './company-profile.service';

@Controller()
export class CompanyProfileMessageController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly profileService: CompanyProfileService,
  ) {
    this.logger.setServiceName('user-service');
  }

  @MessagePattern(MessagePatterns.COMPANY_PROFILE_GET)
  async handleGetProfile(@Payload() data: { tenantSlug: string; context: any }) {
    this.logger.log(`Fetching company profile for '${data.tenantSlug}'`, 'CompanyProfileController', data.context);
    return this.profileService.getProfile(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.COMPANY_PROFILE_UPDATE)
  async handleUpdateProfile(@Payload() data: { tenantSlug: string; updateData: any; context: any }) {
    this.logger.log(`Updating company profile for '${data.tenantSlug}'`, 'CompanyProfileController', data.context);
    return this.profileService.updateProfile(data.tenantSlug, data.updateData);
  }
}
