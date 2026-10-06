import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectionManagerService, SuperUserSchema, SuperRoleSchema, SuperPermissionSchema, SuperUserStatus } from '@tribyte/common';
import { comparePassword } from '@tribyte/utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly connectionManager: ConnectionManagerService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const conn = await this.connectionManager.getSuperDatabaseConnection();
    const UserModel = conn.models['SuperUser'] || conn.model('SuperUser', SuperUserSchema);
    conn.models['SuperRole'] || conn.model('SuperRole', SuperRoleSchema);
    conn.models['SuperPermission'] || conn.model('SuperPermission', SuperPermissionSchema);

    const user = await UserModel.findOne({ email }).populate({
      path: 'roles',
      populate: { path: 'permissions' },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== SuperUserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is ' + user.status);
    }

    const isMatch = await comparePassword(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Collect permissions from user's roles
    const permissionsSet = new Set<string>();
    const rolesList: string[] = [];

    if (user.roles) {
      for (const role of user.roles as any[]) {
        rolesList.push(role.name);
        if (role.permissions) {
          for (const perm of role.permissions) {
            permissionsSet.add(perm.slug);
          }
        }
      }
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      roles: rolesList,
      permissions: Array.from(permissionsSet),
    };

    const token = this.jwtService.sign(payload);

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    return {
      accessToken: token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: rolesList,
        permissions: Array.from(permissionsSet),
      },
    };
  }
}
