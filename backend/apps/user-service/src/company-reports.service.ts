import { Injectable } from '@nestjs/common';
import {
  ConnectionManagerService,
  CompanyAuditSettingsSchema,
  CompanyProfileSchema,
  DepartmentSchema,
  BranchSchema,
  TenantUserSchema,
} from '@tribyte/common';

@Injectable()
export class CompanyReportsService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels(tenantSlug: string) {
    const AuditModel = await this.connectionManager.getTenantModel(tenantSlug, 'CompanyAuditSettings', CompanyAuditSettingsSchema);
    const ProfileModel = await this.connectionManager.getTenantModel(tenantSlug, 'CompanyProfile', CompanyProfileSchema);
    const DeptModel = await this.connectionManager.getTenantModel(tenantSlug, 'Department', DepartmentSchema);
    const BranchModel = await this.connectionManager.getTenantModel(tenantSlug, 'Branch', BranchSchema);
    const UserModel = await this.connectionManager.getTenantModel(tenantSlug, 'User', TenantUserSchema);

    return { AuditModel, ProfileModel, DeptModel, BranchModel, UserModel };
  }

  // Audit Settings
  async getAuditSettings(tenantSlug: string) {
    const { AuditModel } = await this.getModels(tenantSlug);
    let settings = await AuditModel.findOne();
    if (!settings) {
      settings = await AuditModel.create({});
    }
    return settings;
  }

  async updateAuditSettings(tenantSlug: string, updateData: any) {
    const { AuditModel } = await this.getModels(tenantSlug);
    let settings = await AuditModel.findOne();
    if (!settings) {
      settings = await AuditModel.create(updateData);
    } else {
      Object.assign(settings, updateData);
      await settings.save();
    }
    return settings;
  }

  // Executive Company Summary Dashboard
  async getDashboardSummary(tenantSlug: string) {
    const { ProfileModel, DeptModel, BranchModel, UserModel } = await this.getModels(tenantSlug);

    const [profile, depts, branches, users] = await Promise.all([
      ProfileModel.findOne(),
      DeptModel.find({ isActive: true }),
      BranchModel.find({ isActive: true }),
      UserModel.find(),
    ]);

    const activeUsersCount = users.filter(u => u.status === 'ACTIVE').length;

    return {
      companyName: profile?.name || tenantSlug.toUpperCase(),
      timezone: profile?.timezone || 'UTC',
      headcount: {
        totalEmployees: users.length,
        activeEmployees: activeUsersCount,
        blockedEmployees: users.length - activeUsersCount,
      },
      organization: {
        departmentsCount: depts.length,
        branchesCount: branches.length,
      },
      workingDays: profile?.workingDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      workingHours: `${profile?.workStartTime || '09:00'} - ${profile?.workEndTime || '17:00'}`,
    };
  }
}
