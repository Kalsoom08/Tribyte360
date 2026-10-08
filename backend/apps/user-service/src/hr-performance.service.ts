import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ConnectionManagerService,
  PerformanceAppraisalSchema,
  EmployeeProfileSchema,
  LeaveRequestSchema,
  AttendanceLogSchema,
  PayrollRecordSchema,
  TenantUserSchema,
  EmploymentStatus,
} from '@tribyte/common';
import mongoose from 'mongoose';

@Injectable()
export class HrPerformanceService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels(tenantSlug: string) {
    await this.connectionManager.getTenantModel(tenantSlug, 'User', TenantUserSchema);
    const AppraisalModel = await this.connectionManager.getTenantModel(tenantSlug, 'PerformanceAppraisal', PerformanceAppraisalSchema);
    const ProfileModel = await this.connectionManager.getTenantModel(tenantSlug, 'EmployeeProfile', EmployeeProfileSchema);
    const LeaveModel = await this.connectionManager.getTenantModel(tenantSlug, 'LeaveRequest', LeaveRequestSchema);
    const AttendanceModel = await this.connectionManager.getTenantModel(tenantSlug, 'AttendanceLog', AttendanceLogSchema);
    const PayrollModel = await this.connectionManager.getTenantModel(tenantSlug, 'PayrollRecord', PayrollRecordSchema);

    return { AppraisalModel, ProfileModel, LeaveModel, AttendanceModel, PayrollModel };
  }

  async createAppraisal(tenantSlug: string, reviewerUserId: string, data: any) {
    try {
      const { AppraisalModel } = await this.getModels(tenantSlug);

      const targetUserId = data.userId;
      if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
        throw new BadRequestException('A valid target userId is required for appraisal');
      }

      const effectiveReviewer = (reviewerUserId && mongoose.Types.ObjectId.isValid(reviewerUserId)) 
        ? reviewerUserId 
        : targetUserId;

      const record = await AppraisalModel.create({
        userId: new mongoose.Types.ObjectId(targetUserId),
        reviewerUserId: new mongoose.Types.ObjectId(effectiveReviewer),
        cycleName: data.cycleName,
        kpis: data.kpis || [],
        overallRating: data.overallRating || 5,
        feedback: data.feedback,
        promotionRecommended: data.promotionRecommended || false,
        salaryIncrementAmount: data.salaryIncrementAmount || 0,
        status: 'COMPLETED',
      });

      return record;
    } catch (err: any) {
      console.error('HrPerformanceService.createAppraisal Error:', err);
      if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
      throw new BadRequestException(err.message || 'Failed to create performance appraisal');
    }
  }

  async findAllAppraisals(tenantSlug: string) {
    const { AppraisalModel } = await this.getModels(tenantSlug);

    const appraisals = await AppraisalModel.find()
      .populate('userId', 'fullName email departmentId designationId')
      .populate('reviewerUserId', 'fullName email')
      .sort({ createdAt: -1 });

    const averageRating = appraisals.length
      ? parseFloat((appraisals.reduce((acc, curr) => acc + curr.overallRating, 0) / appraisals.length).toFixed(2))
      : 5;

    return {
      stats: {
        totalAppraisals: appraisals.length,
        averageRating,
        promotionsRecommended: appraisals.filter((a) => a.promotionRecommended).length,
      },
      appraisals,
    };
  }

  async getHrSummaryReport(tenantSlug: string) {
    const { ProfileModel, LeaveModel, AttendanceModel, PayrollModel } = await this.getModels(tenantSlug);

    const today = new Date().toISOString().split('T')[0];

    const [profiles, leaveRequests, attendanceToday, payrolls] = await Promise.all([
      ProfileModel.find(),
      LeaveModel.find(),
      AttendanceModel.find({ date: today }),
      PayrollModel.find({ status: 'APPROVED' }),
    ]);

    const totalHeadcount = profiles.length;
    const activeCount = profiles.filter((p) => p.status === EmploymentStatus.ACTIVE).length;
    const attritionCount = profiles.filter((p) => p.status === EmploymentStatus.RESIGNED || p.status === EmploymentStatus.TERMINATED).length;
    const attritionRate = totalHeadcount ? parseFloat(((attritionCount / totalHeadcount) * 100).toFixed(2)) : 0;

    const totalPayrollSpent = payrolls.reduce((acc, curr) => acc + curr.netSalary, 0);

    return {
      tenantSlug,
      headcount: {
        total: totalHeadcount,
        active: activeCount,
        attrition: attritionCount,
        attritionRatePercentage: `${attritionRate}%`,
      },
      todayAttendance: {
        date: today,
        loggedCount: attendanceToday.length,
        presentCount: attendanceToday.filter((a) => a.status === 'PRESENT').length,
        lateCount: attendanceToday.filter((a) => a.status === 'LATE').length,
      },
      leavesSummary: {
        totalLeaveRequests: leaveRequests.length,
        pendingApprovals: leaveRequests.filter((l) => l.status === 'PENDING').length,
        approvedLeaves: leaveRequests.filter((l) => l.status === 'APPROVED').length,
      },
      payrollSummary: {
        totalApprovedPayouts: payrolls.length,
        cumulativePayrollSpentUSD: parseFloat(totalPayrollSpent.toFixed(2)),
      },
    };
  }
}
