import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { HrPayrollService } from './hr-payroll.service';

@Controller()
export class HrPayrollMessageController {
  constructor(private readonly payrollService: HrPayrollService) {}

  @MessagePattern(MessagePatterns.HR_SALARY_COMPONENT_CREATE)
  async handleCreateComponent(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.payrollService.createSalaryComponent(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.HR_SALARY_COMPONENT_FIND_ALL)
  async handleFindComponents(@Payload() data: { tenantSlug: string }) {
    return this.payrollService.findAllSalaryComponents(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.HR_PAYROLL_GENERATE_MONTHLY)
  async handleGeneratePayroll(@Payload() data: { tenantSlug: string; month: number; year: number }) {
    return this.payrollService.generateMonthlyPayroll(data.tenantSlug, data.month, data.year);
  }

  @MessagePattern(MessagePatterns.HR_PAYROLL_FIND_ALL)
  async handleFindPayrolls(@Payload() data: { tenantSlug: string; month?: number; year?: number }) {
    return this.payrollService.findAllPayrolls(data.tenantSlug, data.month, data.year);
  }

  @MessagePattern(MessagePatterns.HR_PAYROLL_APPROVE)
  async handleApprovePayroll(@Payload() data: { tenantSlug: string; month: number; year: number; approverUserId: string }) {
    return this.payrollService.approvePayroll(data.tenantSlug, data.month, data.year, data.approverUserId);
  }
}
