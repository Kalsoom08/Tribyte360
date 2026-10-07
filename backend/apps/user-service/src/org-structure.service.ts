import { Injectable, ConflictException } from '@nestjs/common';
import {
  ConnectionManagerService,
  DepartmentSchema,
  DesignationSchema,
  BranchSchema,
  CostCenterSchema,
} from '@tribyte/common';

@Injectable()
export class OrgStructureService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels(tenantSlug: string) {
    const DeptModel = await this.connectionManager.getTenantModel(tenantSlug, 'Department', DepartmentSchema);
    const DesigModel = await this.connectionManager.getTenantModel(tenantSlug, 'Designation', DesignationSchema);
    const BranchModel = await this.connectionManager.getTenantModel(tenantSlug, 'Branch', BranchSchema);
    const CostModel = await this.connectionManager.getTenantModel(tenantSlug, 'CostCenter', CostCenterSchema);
    return { DeptModel, DesigModel, BranchModel, CostModel };
  }

  // Departments
  async createDepartment(tenantSlug: string, data: any) {
    const { DeptModel } = await this.getModels(tenantSlug);
    const existing = await DeptModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Department code '${data.code}' already exists`);
    }
    return DeptModel.create({ ...data, code: data.code.toUpperCase() });
  }

  async findAllDepartments(tenantSlug: string) {
    const { DeptModel } = await this.getModels(tenantSlug);
    return DeptModel.find({ isActive: true }).sort({ name: 1 });
  }

  // Designations
  async createDesignation(tenantSlug: string, data: any) {
    const { DesigModel } = await this.getModels(tenantSlug);
    const existing = await DesigModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Designation code '${data.code}' already exists`);
    }
    return DesigModel.create({ ...data, code: data.code.toUpperCase() });
  }

  async findAllDesignations(tenantSlug: string) {
    const { DesigModel } = await this.getModels(tenantSlug);
    return DesigModel.find({ isActive: true }).populate('departmentId', 'name code').sort({ title: 1 });
  }

  // Branches
  async createBranch(tenantSlug: string, data: any) {
    const { BranchModel } = await this.getModels(tenantSlug);
    const existing = await BranchModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Branch code '${data.code}' already exists`);
    }
    return BranchModel.create({ ...data, code: data.code.toUpperCase() });
  }

  async findAllBranches(tenantSlug: string) {
    const { BranchModel } = await this.getModels(tenantSlug);
    return BranchModel.find({ isActive: true }).sort({ name: 1 });
  }

  // Cost Centers
  async createCostCenter(tenantSlug: string, data: any) {
    const { CostModel } = await this.getModels(tenantSlug);
    const existing = await CostModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Cost Center code '${data.code}' already exists`);
    }
    return CostModel.create({ ...data, code: data.code.toUpperCase() });
  }

  async findAllCostCenters(tenantSlug: string) {
    const { CostModel } = await this.getModels(tenantSlug);
    return CostModel.find({ isActive: true }).sort({ name: 1 });
  }
}
