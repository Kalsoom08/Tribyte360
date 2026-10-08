import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ConnectionManagerService,
  LeaveTypeSchema,
  LeaveRequestSchema,
  LeaveRequestStatus,
  TenantUserSchema,
} from '@tribyte/common';

@Injectable()
export class HrLeaveService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels(tenantSlug: string) {
    const LeaveTypeModel = await this.connectionManager.getTenantModel(tenantSlug, 'LeaveType', LeaveTypeSchema);
    const LeaveRequestModel = await this.connectionManager.getTenantModel(tenantSlug, 'LeaveRequest', LeaveRequestSchema);
    await this.connectionManager.getTenantModel(tenantSlug, 'User', TenantUserSchema);

    return { LeaveTypeModel, LeaveRequestModel };
  }

  // Leave Types
  async createLeaveType(tenantSlug: string, data: any) {
    const { LeaveTypeModel } = await this.getModels(tenantSlug);
    const existing = await LeaveTypeModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Leave type code '${data.code}' already exists`);
    }

    return LeaveTypeModel.create({
      name: data.name,
      code: data.code.toUpperCase(),
      defaultDaysPerYear: data.defaultDaysPerYear || 14,
      isPaid: data.isPaid ?? true,
      allowCarryForward: data.allowCarryForward ?? true,
      maxCarryForwardDays: data.maxCarryForwardDays || 5,
    });
  }

  async findAllLeaveTypes(tenantSlug: string) {
    const { LeaveTypeModel } = await this.getModels(tenantSlug);

    // Seed default leave types if empty
    const count = await LeaveTypeModel.countDocuments();
    if (count === 0) {
      await LeaveTypeModel.create([
        { name: 'Annual Paid Leave', code: 'ANNUAL', defaultDaysPerYear: 18, isPaid: true, allowCarryForward: true },
        { name: 'Sick Leave', code: 'SICK', defaultDaysPerYear: 10, isPaid: true, allowCarryForward: false },
        { name: 'Casual Leave', code: 'CASUAL', defaultDaysPerYear: 6, isPaid: true, allowCarryForward: false },
        { name: 'Unpaid Leave', code: 'UNPAID', defaultDaysPerYear: 30, isPaid: false, allowCarryForward: false },
      ]);
    }

    return LeaveTypeModel.find({ isActive: true }).sort({ name: 1 });
  }

  // Leave Requests
  async createLeaveRequest(tenantSlug: string, userId: string, data: any) {
    const { LeaveTypeModel, LeaveRequestModel } = await this.getModels(tenantSlug);

    const leaveType = await LeaveTypeModel.findById(data.leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end < start) {
      throw new BadRequestException('End date cannot be earlier than start date');
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return LeaveRequestModel.create({
      userId,
      leaveTypeId: leaveType._id,
      startDate: start,
      endDate: end,
      totalDays: diffDays,
      reason: data.reason,
      status: LeaveRequestStatus.PENDING,
    });
  }

  async findAllLeaveRequests(tenantSlug: string) {
    const { LeaveRequestModel } = await this.getModels(tenantSlug);

    const requests = await LeaveRequestModel.find()
      .populate('userId', 'fullName email departmentId')
      .populate('leaveTypeId', 'name code isPaid')
      .populate('approvedByUserId', 'fullName email')
      .sort({ createdAt: -1 });

    const stats = {
      totalRequests: requests.length,
      pendingCount: requests.filter((r) => r.status === LeaveRequestStatus.PENDING).length,
      approvedCount: requests.filter((r) => r.status === LeaveRequestStatus.APPROVED).length,
      rejectedCount: requests.filter((r) => r.status === LeaveRequestStatus.REJECTED).length,
    };

    return { stats, leaveRequests: requests };
  }

  async updateLeaveRequestStatus(
    tenantSlug: string,
    requestId: string,
    approverUserId: string,
    status: LeaveRequestStatus,
    rejectionReason?: string,
  ) {
    const { LeaveRequestModel } = await this.getModels(tenantSlug);

    const request = await LeaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    request.status = status;
    request.approvedByUserId = approverUserId;
    if (status === LeaveRequestStatus.REJECTED && rejectionReason) {
      request.rejectionReason = rejectionReason;
    }

    await request.save();
    return request;
  }
}
