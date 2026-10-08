import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { AccPayableService } from './acc-payable.service';

@Controller()
export class AccPayableMessageController {
  constructor(private readonly payableService: AccPayableService) {}

  @MessagePattern(MessagePatterns.ACC_BILL_CREATE)
  async handleCreateBill(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.payableService.createBill(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.ACC_BILL_FIND_ALL)
  async handleFindBills(@Payload() data: { tenantSlug: string }) {
    return this.payableService.findAllBills(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.ACC_EXPENSE_CLAIM_CREATE)
  async handleCreateExpenseClaim(@Payload() data: { tenantSlug: string; employeeUserId: string; payload: any }) {
    return this.payableService.createExpenseClaim(data.tenantSlug, data.employeeUserId, data.payload);
  }

  @MessagePattern(MessagePatterns.ACC_EXPENSE_CLAIM_FIND_ALL)
  async handleFindExpenseClaims(@Payload() data: { tenantSlug: string }) {
    return this.payableService.findAllExpenseClaims(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.ACC_EXPENSE_CLAIM_APPROVE)
  async handleApproveExpenseClaim(@Payload() data: { tenantSlug: string; claimId: string; approverUserId: string; status: any; rejectionReason?: string }) {
    return this.payableService.approveExpenseClaim(
      data.tenantSlug,
      data.claimId,
      data.approverUserId,
      data.status,
      data.rejectionReason,
    );
  }
}
