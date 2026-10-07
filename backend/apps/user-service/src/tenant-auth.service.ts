import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectionManagerService, CompanyProfileSchema } from '@tribyte/common';
import { comparePassword } from '@tribyte/utils';
import { Schema } from 'mongoose';

const TenantUserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, default: 'TENANT_ADMIN' },
  status: { type: String, default: 'ACTIVE' },
}, { timestamps: true });

@Injectable()
export class TenantAuthService {
  constructor(
    private readonly connectionManager: ConnectionManagerService,
    private readonly jwtService: JwtService,
  ) {}

  async login(tenantSlug: string, email: string, pass: string) {
    if (!tenantSlug) {
      throw new UnauthorizedException('Tenant context (x-tenant-id) is required');
    }

    const UserModel = await this.connectionManager.getTenantModel(
      tenantSlug,
      'User',
      TenantUserSchema,
    );

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'BLOCKED') {
      throw new ForbiddenException('Your account has been blocked by the platform administrator');
    }

    const isMatch = await comparePassword(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantSlug: tenantSlug.toLowerCase(),
      permissions: ['company.manage', 'users.manage', 'reports.view'],
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      tenantSlug: tenantSlug.toLowerCase(),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
