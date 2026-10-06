import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConnectionManagerService, SuperUserSchema, SuperRoleSchema, SuperPermissionSchema, SuperUserStatus } from '@tribyte/common';
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

      // 1. Seed Permissions
      const permissions = [
        { slug: 'tenants.read', name: 'View Tenants', module: 'TENANT_MANAGEMENT' },
        { slug: 'tenants.create', name: 'Create Tenants', module: 'TENANT_MANAGEMENT' },
        { slug: 'tenants.update', name: 'Update Tenants', module: 'TENANT_MANAGEMENT' },
        { slug: 'tenants.delete', name: 'Delete Tenants', module: 'TENANT_MANAGEMENT' },
        { slug: 'users.manage', name: 'Manage Super Users', module: 'SUPER_AUTH' },
        { slug: 'roles.manage', name: 'Manage Super Roles', module: 'SUPER_AUTH' },
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
    } catch (error) {
      console.error('Failed to seed Super Database:', error);
    }
  }
}
