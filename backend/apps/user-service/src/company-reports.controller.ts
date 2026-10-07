import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { CompanyReportsService } from './company-reports.service';

@Controller()
export class CompanyReportsMessageController {
  constructor(private readonly reportsService: CompanyReportsService) {}

  @MessagePattern(MessagePatterns.COMPANY_AUDIT_SETTINGS_GET)
  async handleGetAuditSettings(@Payload() data: { tenantSlug: string }) {
    return this.reportsService.getAuditSettings(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.COMPANY_AUDIT_SETTINGS_UPDATE)
  async handleUpdateAuditSettings(@Payload() data: { tenantSlug: string; updateData: any }) {
    return this.reportsService.updateAuditSettings(data.tenantSlug, data.updateData);
  }

  @MessagePattern(MessagePatterns.COMPANY_DASHBOARD_SUMMARY)
  async handleGetDashboardSummary(@Payload() data: { tenantSlug: string }) {
    return this.reportsService.getDashboardSummary(data.tenantSlug);
  }
}
