import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import {
  ConnectionManagerService,
  TenantRoleSchema,
  DepartmentSchema,
  DesignationSchema,
  BranchSchema,
  CostCenterSchema,
  TenantUserSchema,
} from '@tribyte/common';
import { hashPassword } from '@tribyte/utils';

@Injectable()
export class TenantUserMgmtService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels(tenantSlug: string) {
    const RoleModel = await this.connectionManager.getTenantModel(tenantSlug, 'TenantRole', TenantRoleSchema);
    const UserModel = await this.connectionManager.getTenantModel(tenantSlug, 'User', TenantUserSchema);
    
    await this.connectionManager.getTenantModel(tenantSlug, 'Department', DepartmentSchema);
    await this.connectionManager.getTenantModel(tenantSlug, 'Designation', DesignationSchema);
    await this.connectionManager.getTenantModel(tenantSlug, 'Branch', BranchSchema);
    await this.connectionManager.getTenantModel(tenantSlug, 'CostCenter', CostCenterSchema);

    return { RoleModel, UserModel };
  }

  async createRole(tenantSlug: string, data: { name: string; description?: string; permissions: string[] }) {
    const { RoleModel } = await this.getModels(tenantSlug);
    const existing = await RoleModel.findOne({ name: data.name.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Role '${data.name}' already exists in company`);
    }

    return RoleModel.create({
      name: data.name.toUpperCase(),
      description: data.description,
      permissions: data.permissions || [],
    });
  }

  async findAllRoles(tenantSlug: string) {
    const { RoleModel } = await this.getModels(tenantSlug);

    const count = await RoleModel.countDocuments();
    if (count === 0) {
      await RoleModel.create([
        { name: 'TENANT_ADMIN', description: 'Full company administrator access', isSystemRole: true, permissions: ['company.manage', 'users.manage', 'hr.manage', 'finance.manage'] },
        { name: 'HR_MANAGER', description: 'Human resources and employee manager', isSystemRole: false, permissions: ['hr.employees.manage', 'hr.leaves.approve'] },
        { name: 'ACCOUNTANT', description: 'Financial ledger and accountant access', isSystemRole: false, permissions: ['finance.ledger.manage', 'finance.invoices.manage'] },
        { name: 'EMPLOYEE', description: 'Standard employee portal access', isSystemRole: true, permissions: ['employee.self_service'] },
      ]);
    }

    return RoleModel.find().sort({ name: 1 });
  }

  async createUser(tenantSlug: string, data: any) {
    const { UserModel } = await this.getModels(tenantSlug);

    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictException(`User '${data.email}' already exists in company`);
    }

    const temporaryPassword = data.password || 'Emp@123456';
    const hashedPassword = await hashPassword(temporaryPassword);

    const newUser = await UserModel.create({
      email: data.email.toLowerCase(),
      passwordHash: hashedPassword,
      fullName: data.fullName,
      role: data.role || 'EMPLOYEE',
      roleId: data.roleId || null,
      departmentId: data.departmentId || null,
      designationId: data.designationId || null,
      branchId: data.branchId || null,
      costCenterId: data.costCenterId || null,
      phone: data.phone,
      status: 'ACTIVE',
    });

    return {
      user: newUser,
      initialCredentials: {
        email: newUser.email,
        temporaryPassword,
        subdomainUrl: `https://${tenantSlug}.tribyte360.com`,
      },
    };
  }

  async findAllUsers(tenantSlug: string) {
    const { UserModel } = await this.getModels(tenantSlug);

    const users = await UserModel.find()
      .populate('departmentId', 'name code')
      .populate('designationId', 'title code')
      .populate('branchId', 'name code')
      .populate('costCenterId', 'name code')
      .sort({ createdAt: -1 });

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'ACTIVE').length,
      blockedUsers: users.filter((u) => u.status === 'BLOCKED').length,
    };

    return { stats, users };
  }

  async findUserById(tenantSlug: string, id: string) {
    const { UserModel } = await this.getModels(tenantSlug);
    const user = await UserModel.findById(id)
      .populate('departmentId', 'name code')
      .populate('designationId', 'title code')
      .populate('branchId', 'name code')
      .populate('costCenterId', 'name code');

    if (!user) {
      throw new NotFoundException('Company user not found');
    }
    return user;
  }
}
