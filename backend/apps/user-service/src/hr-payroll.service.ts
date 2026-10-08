import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import {
  ConnectionManagerService,
  SalaryComponentSchema,
  PayrollRecordSchema,
  EmploymentContractSchema,
  TenantUserSchema,
  PayrollStatus,
  ComponentType,
} from '@tribyte/common';

@Injectable()
export class HrPayrollService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels(tenantSlug: string) {
    const ComponentModel = await this.connectionManager.getTenantModel(tenantSlug, 'SalaryComponent', SalaryComponentSchema);
    const PayrollModel = await this.connectionManager.getTenantModel(tenantSlug, 'PayrollRecord', PayrollRecordSchema);
    const ContractModel = await this.connectionManager.getTenantModel(tenantSlug, 'EmploymentContract', EmploymentContractSchema);
    const UserModel = await this.connectionManager.getTenantModel(tenantSlug, 'User', TenantUserSchema);

    return { ComponentModel, PayrollModel, ContractModel, UserModel };
  }

  // Salary Components
  async createSalaryComponent(tenantSlug: string, data: any) {
    const { ComponentModel } = await this.getModels(tenantSlug);
    const existing = await ComponentModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Salary component code '${data.code}' already exists`);
    }

    return ComponentModel.create({
      name: data.name,
      code: data.code.toUpperCase(),
      type: data.type || ComponentType.ALLOWANCE,
      defaultAmount: data.defaultAmount || 0,
      isTaxable: data.isTaxable ?? true,
    });
  }

  async findAllSalaryComponents(tenantSlug: string) {
    const { ComponentModel } = await this.getModels(tenantSlug);

    const count = await ComponentModel.countDocuments();
    if (count === 0) {
      await ComponentModel.create([
        { name: 'Housing Allowance', code: 'HOUSING', type: ComponentType.ALLOWANCE, defaultAmount: 500 },
        { name: 'Transport Allowance', code: 'TRANSPORT', type: ComponentType.ALLOWANCE, defaultAmount: 200 },
        { name: 'Income Tax Deduction', code: 'TAX_DEDUCTION', type: ComponentType.DEDUCTION, defaultAmount: 150 },
      ]);
    }

    return ComponentModel.find({ isActive: true }).sort({ name: 1 });
  }

  // Generate Monthly Payroll for All Active Employees
  async generateMonthlyPayroll(tenantSlug: string, month: number, year: number) {
    const { PayrollModel, ContractModel, UserModel, ComponentModel } = await this.getModels(tenantSlug);

    const users = await UserModel.find({ status: 'ACTIVE' });
    const components = await ComponentModel.find({ isActive: true });

    const defaultAllowances = components.filter((c) => c.type === ComponentType.ALLOWANCE);
    const defaultDeductions = components.filter((c) => c.type === ComponentType.DEDUCTION);

    const generatedPayrolls = [];

    for (const user of users) {
      const contract = await ContractModel.findOne({ userId: user._id, isActive: true });
      const baseSalary = contract ? contract.baseSalary / 12 : 5000; // Monthly base

      const allowancesList = defaultAllowances.map((a) => ({
        name: a.name,
        code: a.code,
        amount: a.defaultAmount,
        type: ComponentType.ALLOWANCE,
      }));

      const deductionsList = defaultDeductions.map((d) => ({
        name: d.name,
        code: d.code,
        amount: d.defaultAmount,
        type: ComponentType.DEDUCTION,
      }));

      const totalAllowances = allowancesList.reduce((acc, curr) => acc + curr.amount, 0);
      const totalDeductions = deductionsList.reduce((acc, curr) => acc + curr.amount, 0);

      const grossSalary = baseSalary + totalAllowances;
      const netSalary = grossSalary - totalDeductions;

      // Upsert payroll for the given month/year
      const record = await PayrollModel.findOneAndUpdate(
        { userId: user._id, month, year },
        {
          userId: user._id,
          month,
          year,
          baseSalary: parseFloat(baseSalary.toFixed(2)),
          allowances: allowancesList,
          deductions: deductionsList,
          grossSalary: parseFloat(grossSalary.toFixed(2)),
          netSalary: parseFloat(netSalary.toFixed(2)),
          status: PayrollStatus.GENERATED,
        },
        { upsert: true, new: true },
      );

      generatedPayrolls.push(record);
    }

    return {
      message: `Payroll generated for month ${month}/${year}`,
      processedCount: generatedPayrolls.length,
      payrolls: generatedPayrolls,
    };
  }

  async findAllPayrolls(tenantSlug: string, month?: number, year?: number) {
    const { PayrollModel } = await this.getModels(tenantSlug);
    const query: any = {};
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const payrolls = await PayrollModel.find(query)
      .populate('userId', 'fullName email departmentId designationId')
      .populate('approvedByUserId', 'fullName email')
      .sort({ createdAt: -1 });

    const totalNetPayout = payrolls.reduce((acc, curr) => acc + curr.netSalary, 0);

    return {
      stats: {
        totalRecords: payrolls.length,
        totalNetPayout: parseFloat(totalNetPayout.toFixed(2)),
      },
      payrolls,
    };
  }

  async approvePayroll(tenantSlug: string, month: number, year: number, approverUserId: string) {
    const { PayrollModel } = await this.getModels(tenantSlug);

    const updated = await PayrollModel.updateMany(
      { month, year, status: PayrollStatus.GENERATED },
      { status: PayrollStatus.APPROVED, approvedByUserId: approverUserId, paidDate: new Date() },
    );

    return {
      message: `Payroll for month ${month}/${year} approved and marked PAID`,
      approvedCount: updated.modifiedCount,
    };
  }
}
