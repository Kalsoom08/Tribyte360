import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { HrLeaveService } from './hr-leave.service';

@Controller()
export class HrLeaveMessageController {
  constructor(private readonly leaveService: HrLeaveService) {}

  @MessagePattern(MessagePatterns.HR_LEAVE_TYPE_CREATE)
  async handleCreateLeaveType(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.leaveService.createLeaveType(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.HR_LEAVE_TYPE_FIND_ALL)
  async handleFindLeaveTypes(@Payload() data: { tenantSlug: string }) {
    return this.leaveService.findAllLeaveTypes(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.HR_LEAVE_REQUEST_CREATE)
  async handleCreateLeaveRequest(@Payload() data: { tenantSlug: string; userId: string; payload: any }) {
    return this.leaveService.createLeaveRequest(data.tenantSlug, data.userId, data.payload);
  }

  @MessagePattern(MessagePatterns.HR_LEAVE_REQUEST_FIND_ALL)
  async handleFindLeaveRequests(@Payload() data: { tenantSlug: string }) {
    return this.leaveService.findAllLeaveRequests(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.HR_LEAVE_REQUEST_UPDATE_STATUS)
  async handleUpdateStatus(@Payload() data: { tenantSlug: string; requestId: string; approverUserId: string; status: any; rejectionReason?: string }) {
    return this.leaveService.updateLeaveRequestStatus(
      data.tenantSlug,
      data.requestId,
      data.approverUserId,
      data.status,
      data.rejectionReason,
    );
  }
}
