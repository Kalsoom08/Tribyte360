import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { AccPayrollPostingService } from './acc-payroll-posting.service';

@Controller()
export class AccPayrollPostingMessageController {
  constructor(private readonly postingService: AccPayrollPostingService) {}

  @MessagePattern(MessagePatterns.ACC_PAYROLL_POST_JOURNAL)
  async handlePostPayrollJournal(@Payload() data: { tenantSlug: string; month: number; year: number; postedByUserId: string }) {
    return this.postingService.postPayrollJournal(data.tenantSlug, data.month, data.year, data.postedByUserId);
  }

  @MessagePattern(MessagePatterns.ACC_PAYROLL_EXPORT_BANK_FILE)
  async handleExportBankFile(@Payload() data: { tenantSlug: string; month: number; year: number }) {
    return this.postingService.exportBankDisbursementFile(data.tenantSlug, data.month, data.year);
  }
}
