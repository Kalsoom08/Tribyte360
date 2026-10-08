import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { AccReportsService } from './acc-reports.service';

@Controller()
export class AccReportsMessageController {
  constructor(private readonly reportsService: AccReportsService) {}

  @MessagePattern(MessagePatterns.ACC_TAX_CREATE)
  async handleCreateTax(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.reportsService.createTax(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.ACC_TAX_FIND_ALL)
  async handleFindTaxes(@Payload() data: { tenantSlug: string }) {
    return this.reportsService.findAllTaxes(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.ACC_PROFIT_LOSS_REPORT)
  async handleGetProfitLoss(@Payload() data: { tenantSlug: string }) {
    return this.reportsService.getProfitLossReport(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.ACC_BALANCE_SHEET_REPORT)
  async handleGetBalanceSheet(@Payload() data: { tenantSlug: string }) {
    return this.reportsService.getBalanceSheetReport(data.tenantSlug);
  }
}
