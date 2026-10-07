import { Injectable } from '@nestjs/common';
import { ConnectionManagerService, CompanyPolicySchema } from '@tribyte/common';

@Injectable()
export class CompanyPolicyService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getPolicyModel(tenantSlug: string) {
    return this.connectionManager.getTenantModel(
      tenantSlug,
      'CompanyPolicy',
      CompanyPolicySchema,
    );
  }

  async getPolicy(tenantSlug: string) {
    const PolicyModel = await this.getPolicyModel(tenantSlug);
    let policy = await PolicyModel.findOne();

    if (!policy) {
      policy = await PolicyModel.create({});
    }
    return policy;
  }

  async updatePolicy(tenantSlug: string, updateData: any) {
    const PolicyModel = await this.getPolicyModel(tenantSlug);
    let policy = await PolicyModel.findOne();

    if (!policy) {
      policy = await PolicyModel.create(updateData);
    } else {
      if (updateData.leavePolicy) Object.assign(policy.leavePolicy, updateData.leavePolicy);
      if (updateData.attendancePolicy) Object.assign(policy.attendancePolicy, updateData.attendancePolicy);
      if (updateData.overtimePolicy) Object.assign(policy.overtimePolicy, updateData.overtimePolicy);
      if (updateData.salaryPolicy) Object.assign(policy.salaryPolicy, updateData.salaryPolicy);
      if (updateData.expensePolicy) Object.assign(policy.expensePolicy, updateData.expensePolicy);

      await policy.save();
    }

    return policy;
  }
}
