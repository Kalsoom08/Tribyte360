import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ConnectionManagerService, SuperUserSchema, SuperRoleSchema, SuperUserStatus } from '@tribyte/common';
import { hashPassword } from '@tribyte/utils';

@Injectable()
export class SuperUserService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels() {
    const conn = await this.connectionManager.getSuperDatabaseConnection();
    const UserModel = conn.models['SuperUser'] || conn.model('SuperUser', SuperUserSchema);
    const RoleModel = conn.models['SuperRole'] || conn.model('SuperRole', SuperRoleSchema);
    return { conn, UserModel, RoleModel };
  }

  async createSuperUser(data: { email: string; fullName: string; password: string; roles: string[] }) {
    const { UserModel, RoleModel } = await this.getModels();

    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictException(`Super User email '${data.email}' already exists`);
    }

    const roleDocs = await RoleModel.find({ name: { $in: data.roles } });
    if (!roleDocs.length) {
      throw new NotFoundException('Specified roles do not exist');
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = await UserModel.create({
      email: data.email.toLowerCase(),
      fullName: data.fullName,
      passwordHash: hashedPassword,
      roles: roleDocs.map((r) => r._id),
      status: SuperUserStatus.ACTIVE,
    });

    return {
      id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      status: newUser.status,
      roles: data.roles,
      createdAt: newUser.createdAt,
    };
  }

  async findAllSuperUsers() {
    const { conn, UserModel } = await this.getModels();
    conn.models['SuperRole'] || conn.model('SuperRole', SuperRoleSchema);

    const users = await UserModel.find().populate('roles', 'name description').sort({ createdAt: -1 });

    const stats = {
      total: users.length,
      active: users.filter((u) => u.status === SuperUserStatus.ACTIVE).length,
      blocked: users.filter((u) => u.status === SuperUserStatus.BLOCKED).length,
    };

    return { stats, users };
  }
}