import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { CompanyPolicyService } from './company-policy.service';

@Controller()
export class CompanyPolicyMessageController {
  constructor(private readonly policyService: CompanyPolicyService) {}

  @MessagePattern(MessagePatterns.COMPANY_POLICY_GET)
  async handleGetPolicy(@Payload() data: { tenantSlug: string }) {
    return this.policyService.getPolicy(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.COMPANY_POLICY_UPDATE)
  async handleUpdatePolicy(@Payload() data: { tenantSlug: string; updateData: any }) {
    return this.policyService.updatePolicy(data.tenantSlug, data.updateData);
  }
}
