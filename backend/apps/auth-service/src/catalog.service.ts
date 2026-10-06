import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ConnectionManagerService, ModuleCatalogSchema, SubscriptionPlanSchema, TenantSchema } from '@tribyte/common';

@Injectable()
export class CatalogService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels() {
    const conn = await this.connectionManager.getSuperDatabaseConnection();
    const ModuleModel = conn.models['ModuleCatalog'] || conn.model('ModuleCatalog', ModuleCatalogSchema);
    const PlanModel = conn.models['SubscriptionPlan'] || conn.model('SubscriptionPlan', SubscriptionPlanSchema);
    const TenantModel = conn.models['Tenant'] || conn.model('Tenant', TenantSchema);
    return { ModuleModel, PlanModel, TenantModel };
  }

  // Module Catalog Operations
  async createModule(data: any) {
    const { ModuleModel } = await this.getModels();
    const existing = await ModuleModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Module code '${data.code}' already exists`);
    }

    return ModuleModel.create({
      name: data.name,
      code: data.code.toUpperCase(),
      description: data.description,
      version: data.version || '1.0.0',
      isDefault: data.isDefault || false,
    });
  }

  async findAllModules() {
    const { ModuleModel } = await this.getModels();
    return ModuleModel.find({ isActive: true }).sort({ name: 1 });
  }

  // Subscription Plan Operations
  async createPlan(data: any) {
    const { PlanModel } = await this.getModels();
    const existing = await PlanModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Plan code '${data.code}' already exists`);
    }

    return PlanModel.create({
      name: data.name,
      code: data.code.toUpperCase(),
      maxUsers: data.maxUsers,
      allowedModules: data.allowedModules.map((m: string) => m.toUpperCase()),
      priceMonthly: data.priceMonthly || 0,
      trialDays: data.trialDays || 14,
    });
  }

  async findAllPlans() {
    const { PlanModel } = await this.getModels();
    return PlanModel.find({ isActive: true }).sort({ priceMonthly: 1 });
  }

  // Tenant Module Assignment
  async assignTenantModules(tenantId: string, installedApps: string[]) {
    const { TenantModel } = await this.getModels();
    const upperApps = installedApps.map((a) => a.toUpperCase());

    const tenant = await TenantModel.findByIdAndUpdate(
      tenantId,
      { installedApps: upperApps },
      { new: true },
    );

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      message: 'Tenant installed modules updated successfully',
      tenantId: tenant._id,
      tenantSlug: tenant.slug,
      installedApps: tenant.installedApps,
    };
  }
}
