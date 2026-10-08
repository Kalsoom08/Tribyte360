import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ConnectionManagerService,
  EmployeeProfileSchema,
  EmploymentContractSchema,
  TenantUserSchema,
  DepartmentSchema,
  DesignationSchema,
  BranchSchema,
  CostCenterSchema,
  EmploymentStatus,
} from '@tribyte/common';
import { hashPassword } from '@tribyte/utils';

@Injectable()
export class HrEmployeeService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels(tenantSlug: string) {
    await this.connectionManager.getTenantModel(tenantSlug, 'Department', DepartmentSchema);
    await this.connectionManager.getTenantModel(tenantSlug, 'Designation', DesignationSchema);
    await this.connectionManager.getTenantModel(tenantSlug, 'Branch', BranchSchema);
    await this.connectionManager.getTenantModel(tenantSlug, 'CostCenter', CostCenterSchema);

    const UserModel = await this.connectionManager.getTenantModel(tenantSlug, 'User', TenantUserSchema);
    const ProfileModel = await this.connectionManager.getTenantModel(tenantSlug, 'EmployeeProfile', EmployeeProfileSchema);
    const ContractModel = await this.connectionManager.getTenantModel(tenantSlug, 'EmploymentContract', EmploymentContractSchema);

    return { ProfileModel, ContractModel, UserModel };
  }

  async createEmployee(tenantSlug: string, data: any) {
    try {
      const { ProfileModel, ContractModel, UserModel } = await this.getModels(tenantSlug);

      const existingUser = await UserModel.findOne({ email: data.email.toLowerCase() });
      if (existingUser) {
        throw new ConflictException(`Employee email '${data.email}' already exists`);
      }

      const count = await ProfileModel.countDocuments();
      const employeeCode = data.employeeCode || `EMP-${1000 + count + 1}`;

      const existingCode = await ProfileModel.findOne({ employeeCode: employeeCode.toUpperCase() });
      if (existingCode) {
        throw new ConflictException(`Employee code '${employeeCode}' already exists`);
      }

      // 1. Create User
      const tempPassword = data.password || 'Emp@123456';
      const hashedPassword = await hashPassword(tempPassword);

      const user = await UserModel.create({
        email: data.email.toLowerCase(),
        passwordHash: hashedPassword,
        fullName: data.fullName,
        role: data.role || 'EMPLOYEE',
        departmentId: data.departmentId || null,
        designationId: data.designationId || null,
        branchId: data.branchId || null,
        costCenterId: data.costCenterId || null,
        phone: data.phone,
        status: 'ACTIVE',
      });

      // Map document items cleanly
      const formattedDocuments = (data.documents || []).map((doc: any) => ({
        docType: doc.docType || doc.type || 'OTHER',
        documentNumber: doc.documentNumber || 'N/A',
        documentUrl: doc.documentUrl,
        issueDate: doc.issueDate ? new Date(doc.issueDate) : undefined,
        expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
      }));

      // 2. Create Profile
      const profile = await ProfileModel.create({
        userId: user._id,
        employeeCode: employeeCode.toUpperCase(),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        nationality: data.nationality,
        status: EmploymentStatus.ACTIVE,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        documents: formattedDocuments,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelation: data.emergencyContactRelation,
      });

      // 3. Create Contract
      const contract = await ContractModel.create({
        userId: user._id,
        contractType: data.contractType || 'FULL_TIME',
        startDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        probationDays: data.probationDays || 90,
        noticePeriodDays: data.noticePeriodDays || 30,
        baseSalary: data.baseSalary || 0,
        currency: data.currency || 'USD',
        isActive: true,
      });

      return {
        user,
        profile,
        contract,
        initialCredentials: {
          email: user.email,
          temporaryPassword: tempPassword,
          subdomainUrl: `https://${tenantSlug}.tribyte360.com`,
        },
      };
    } catch (err: any) {
      console.error('HrEmployeeService.createEmployee Error:', err);
      if (err instanceof ConflictException || err instanceof NotFoundException) throw err;
      throw new BadRequestException(err.message || 'Failed to create employee profile');
    }
  }

  async findAllEmployees(tenantSlug: string) {
    const { ProfileModel } = await this.getModels(tenantSlug);

    const profiles = await ProfileModel.find()
      .populate({
        path: 'userId',
        select: 'fullName email phone role departmentId designationId branchId status',
        populate: [
          { path: 'departmentId', select: 'name code' },
          { path: 'designationId', select: 'title code' },
        ],
      })
      .sort({ createdAt: -1 });

    const stats = {
      total: profiles.length,
      active: profiles.filter((p) => p.status === EmploymentStatus.ACTIVE).length,
      resigned: profiles.filter((p) => p.status === EmploymentStatus.RESIGNED).length,
      terminated: profiles.filter((p) => p.status === EmploymentStatus.TERMINATED).length,
    };

    return { stats, employees: profiles };
  }

  async findEmployeeById(tenantSlug: string, id: string) {
    const { ProfileModel, ContractModel } = await this.getModels(tenantSlug);

    const profile = await ProfileModel.findById(id).populate({
      path: 'userId',
      select: 'fullName email phone role departmentId designationId branchId costCenterId status',
      populate: [
        { path: 'departmentId', select: 'name code' },
        { path: 'designationId', select: 'title code' },
        { path: 'branchId', select: 'name code' },
      ],
    });

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    const contracts = await ContractModel.find({ userId: profile.userId }).sort({ startDate: -1 });

    return { profile, contracts };
  }

  async updateEmploymentStatus(tenantSlug: string, id: string, status: EmploymentStatus, exitReason?: string) {
    const { ProfileModel, UserModel } = await this.getModels(tenantSlug);

    const profile = await ProfileModel.findByIdAndUpdate(
      id,
      {
        status,
        ...(status !== EmploymentStatus.ACTIVE && { exitDate: new Date(), exitReason }),
      },
      { new: true },
    );

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    const userStatus = status === EmploymentStatus.ACTIVE ? 'ACTIVE' : 'BLOCKED';
    await UserModel.findByIdAndUpdate(profile.userId, { status: userStatus });

    return profile;
  }
}
