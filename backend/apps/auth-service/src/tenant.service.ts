import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ConnectionManagerService, TenantSchema, TenantStatus } from '@tribyte/common';
import { hashPassword } from '@tribyte/utils';
import { Schema } from 'mongoose';

const TenantUserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, default: 'TENANT_ADMIN' },
  status: { type: String, default: 'ACTIVE' },
}, { timestamps: true });

@Injectable()
export class TenantService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getTenantModel() {
    const conn = await this.connectionManager.getSuperDatabaseConnection();
    return conn.models['Tenant'] || conn.model('Tenant', TenantSchema);
  }

  async createTenant(data: any) {
    const TenantModel = await this.getTenantModel();

    const existing = await TenantModel.findOne({ slug: data.slug.toLowerCase() });
    if (existing) {
      throw new ConflictException(`Subdomain '${data.slug}' is already taken`);
    }

    const newTenant = await TenantModel.create({
      name: data.name,
      slug: data.slug.toLowerCase(),
      ownerEmail: data.ownerEmail.toLowerCase(),
      phone: data.phone,
      country: data.country || 'United States',
      timezone: data.timezone || 'UTC',
      status: TenantStatus.TRIAL,
      installedApps: data.installedApps || ['HR', 'ACCOUNTING'],
    });

    const tenantSlug = newTenant.slug;
    const initialPassword = 'Owner@123456';
    const hashedPassword = await hashPassword(initialPassword);

    const UserModel = await this.connectionManager.getTenantModel(
      tenantSlug,
      'User',
      TenantUserSchema,
    );

    await UserModel.create({
      email: newTenant.ownerEmail,
      passwordHash: hashedPassword,
      fullName: `${newTenant.name} Owner`,
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
    });

    return {
      tenant: newTenant,
      initialAdminCredentials: {
        email: newTenant.ownerEmail,
        temporaryPassword: initialPassword,
        subdomainUrl: `https://${tenantSlug}.tribyte360.com`,
      },
    };
  }

  async findAllTenants() {
    const TenantModel = await this.getTenantModel();
    const tenants = await TenantModel.find({ isDeleted: false }).sort({ createdAt: -1 });

    const stats = {
      total: tenants.length,
      active: tenants.filter(t => t.status === TenantStatus.ACTIVE).length,
      trial: tenants.filter(t => t.status === TenantStatus.TRIAL).length,
      suspended: tenants.filter(t => t.status === TenantStatus.SUSPENDED).length,
    };

    return { stats, tenants };
  }

  async findTenantById(id: string) {
    const TenantModel = await this.getTenantModel();
    const tenant = await TenantModel.findById(id);
    if (!tenant || tenant.isDeleted) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async updateTenantStatus(id: string, status: TenantStatus) {
    const TenantModel = await this.getTenantModel();
    const tenant = await TenantModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async deleteTenant(id: string) {
    const TenantModel = await this.getTenantModel();
    const tenant = await TenantModel.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date(), status: TenantStatus.DEACTIVATED },
      { new: true },
    );
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return { message: 'Tenant successfully soft-deleted', id };
  }

  async resetTenantAdminPassword(tenantId: string) {
    const tenant = await this.findTenantById(tenantId);
    const newTemporaryPassword = 'Reset@' + Math.random().toString(36).substring(2, 8);
    const hashedPassword = await hashPassword(newTemporaryPassword);

    const UserModel = await this.connectionManager.getTenantModel(
      tenant.slug,
      'User',
      TenantUserSchema,
    );

    const owner = await UserModel.findOneAndUpdate(
      { email: tenant.ownerEmail },
      { passwordHash: hashedPassword },
      { new: true },
    );

    if (!owner) {
      throw new NotFoundException(`Owner account '${tenant.ownerEmail}' not found in database tenant_${tenant.slug}`);
    }

    return {
      message: 'Tenant admin password reset successfully',
      tenantSlug: tenant.slug,
      ownerEmail: tenant.ownerEmail,
      temporaryPassword: newTemporaryPassword,
    };
  }

  async blockTenantAdmin(tenantId: string, isBlocked: boolean) {
    const tenant = await this.findTenantById(tenantId);
    const newStatus = isBlocked ? 'BLOCKED' : 'ACTIVE';

    const UserModel = await this.connectionManager.getTenantModel(
      tenant.slug,
      'User',
      TenantUserSchema,
    );

    const owner = await UserModel.findOneAndUpdate(
      { email: tenant.ownerEmail },
      { status: newStatus },
      { new: true },
    );

    if (!owner) {
      throw new NotFoundException(`Owner account '${tenant.ownerEmail}' not found in database tenant_${tenant.slug}`);
    }

    return {
      message: `Tenant admin account ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      tenantSlug: tenant.slug,
      ownerEmail: tenant.ownerEmail,
      status: newStatus,
    };
  }
}
