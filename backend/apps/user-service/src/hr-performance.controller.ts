import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { HrPerformanceService } from './hr-performance.service';

@Controller()
export class HrPerformanceMessageController {
  constructor(private readonly performanceService: HrPerformanceService) {}

  @MessagePattern(MessagePatterns.HR_APPRAISAL_CREATE)
  async handleCreateAppraisal(@Payload() data: { tenantSlug: string; reviewerUserId: string; payload: any }) {
    return this.performanceService.createAppraisal(data.tenantSlug, data.reviewerUserId, data.payload);
  }

  @MessagePattern(MessagePatterns.HR_APPRAISAL_FIND_ALL)
  async handleFindAppraisals(@Payload() data: { tenantSlug: string }) {
    return this.performanceService.findAllAppraisals(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.HR_REPORTS_SUMMARY)
  async handleGetHrReportsSummary(@Payload() data: { tenantSlug: string }) {
    return this.performanceService.getHrSummaryReport(data.tenantSlug);
  }
}
