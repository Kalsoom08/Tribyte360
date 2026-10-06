import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ConnectionManagerService,
  SuperUserSchema,
  SuperRoleSchema,
  SuperPermissionSchema,
  SuperUserStatus,
  ModuleCatalogSchema,
  SubscriptionPlanSchema,
  AppSettingsSchema,
} from '@tribyte/common';
import { hashPassword } from '@tribyte/utils';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  async onModuleInit() {
    try {
      const conn = await this.connectionManager.getSuperDatabaseConnection();

      const PermissionModel = conn.models['SuperPermission'] || conn.model('SuperPermission', SuperPermissionSchema);
      const RoleModel = conn.models['SuperRole'] || conn.model('SuperRole', SuperRoleSchema);
      const UserModel = conn.models['SuperUser'] || conn.model('SuperUser', SuperUserSchema);
      const ModuleModel = conn.models['ModuleCatalog'] || conn.model('ModuleCatalog', ModuleCatalogSchema);
      const PlanModel = conn.models['SubscriptionPlan'] || conn.model('SubscriptionPlan', SubscriptionPlanSchema);
      const SettingsModel = conn.models['AppSettings'] || conn.model('AppSettings', AppSettingsSchema);

      // 1. Seed Permissions
      const permissions = [
        { slug: 'tenants.read', name: 'View Tenants', module: 'TENANT_MANAGEMENT' },
        { slug: 'tenants.create', name: 'Create Tenants', module: 'TENANT_MANAGEMENT' },
        { slug: 'tenants.update', name: 'Update Tenants', module: 'TENANT_MANAGEMENT' },
        { slug: 'tenants.delete', name: 'Delete Tenants', module: 'TENANT_MANAGEMENT' },
        { slug: 'users.manage', name: 'Manage Super Users', module: 'SUPER_AUTH' },
        { slug: 'roles.manage', name: 'Manage Super Roles', module: 'SUPER_AUTH' },
        { slug: 'modules.manage', name: 'Manage Modules & Plans', module: 'CATALOG_MANAGEMENT' },
        { slug: 'settings.manage', name: 'Manage App Settings', module: 'SYSTEM_SETTINGS' },
        { slug: 'logs.read', name: 'View System Logs', module: 'AUDIT_LOGS' },
      ];

      const permissionDocs = [];
      for (const p of permissions) {
        let perm = await PermissionModel.findOne({ slug: p.slug });
        if (!perm) {
          perm = await PermissionModel.create(p);
          console.log(`Seeded Permission: ${p.slug}`);
        }
        permissionDocs.push(perm._id);
      }

      // 2. Seed Super Admin Role
      let superRole = await RoleModel.findOne({ name: 'SUPER_ADMIN' });
      if (!superRole) {
        superRole = await RoleModel.create({
          name: 'SUPER_ADMIN',
          description: 'Full system access across all super admin features',
          permissions: permissionDocs,
          isSystemRole: true,
        });
        console.log('Seeded Role: SUPER_ADMIN');
      } else {
        superRole.permissions = permissionDocs as any;
        await superRole.save();
      }

      // 3. Seed Default Super Admin User
      const adminEmail = 'admin@tribyte360.com';
      const existingAdmin = await UserModel.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const hashedPassword = await hashPassword('Admin@123456');
        await UserModel.create({
          email: adminEmail,
          passwordHash: hashedPassword,
          fullName: 'Platform Super Admin',
          roles: [superRole._id],
          status: SuperUserStatus.ACTIVE,
        });
        console.log(`Seeded Super Admin User: ${adminEmail} / Admin@123456`);
      }

      // 4. Seed Default Business Modules
      const defaultModules = [
        { name: 'Human Resources', code: 'HR', description: 'Core HR and employee management', isDefault: true },
        { name: 'Accounting & Invoicing', code: 'ACCOUNTING', description: 'Financial accounting and tenant ledger', isDefault: true },
        { name: 'Attendance App', code: 'ATTENDANCE', description: 'Real-time shift and biometric attendance', isDefault: false },
        { name: 'Asset Management', code: 'AMS', description: 'Hardware and physical asset tracking', isDefault: false },
      ];

      for (const m of defaultModules) {
        const exists = await ModuleModel.findOne({ code: m.code });
        if (!exists) {
          await ModuleModel.create(m);
          console.log(`Seeded Business Module: ${m.code}`);
        }
      }

      // 5. Seed Default Subscription Plans
      const defaultPlans = [
        { name: 'Free Starter', code: 'FREE', maxUsers: 5, allowedModules: ['HR'], priceMonthly: 0, trialDays: 30 },
        { name: 'Basic Business', code: 'BASIC', maxUsers: 25, allowedModules: ['HR', 'ATTENDANCE'], priceMonthly: 49, trialDays: 14 },
        { name: 'Enterprise Pro', code: 'PRO', maxUsers: 9999, allowedModules: ['HR', 'ACCOUNTING', 'ATTENDANCE', 'AMS'], priceMonthly: 199, trialDays: 14 },
      ];

      for (const plan of defaultPlans) {
        const exists = await PlanModel.findOne({ code: plan.code });
        if (!exists) {
          await PlanModel.create(plan);
          console.log(`Seeded Subscription Plan: ${plan.code}`);
        }
      }

      // 6. Seed Default App Settings
      const existingSettings = await SettingsModel.findOne();
      if (!existingSettings) {
        await SettingsModel.create({
          appName: 'Tribyte360 ERP',
          defaultLanguage: 'en',
          maintenanceMode: false,
          supportEmail: 'support@tribyte360.com',
          platformDomain: 'https://tribyte360.com',
        });
        console.log('Seeded App Settings');
      }

    } catch (error) {
      console.error('Failed to seed Super Database:', error);
    }
  }
}
