import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RequestContext } from '@tribyte/types';
import { generateCorrelationId, generateRequestId } from '@tribyte/utils';

// Context Decorators & Guards
@Injectable()
export class TenantContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] as string;

    request.context = {
      correlationId: (request.headers['x-correlation-id'] as string) || generateCorrelationId(),
      requestId: generateRequestId(),
      tenantId: tenantId || undefined,
      language: (request.headers['accept-language'] as string) || 'en',
    } as RequestContext;

    return true;
  }
}

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.context?.tenantId;
  },
);

export const ReqContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.context;
  },
);

// RBAC Permissions Decorator
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Super Admin Auth Guard
@Injectable()
export class SuperAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev_secret_key',
      });
      request.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token is expired or invalid');
    }
  }
}

// Permissions Guard
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('User permissions not found');
    }

    const hasPermission = requiredPermissions.every((perm) => user.permissions.includes(perm));
    if (!hasPermission) {
      throw new ForbiddenException(`Required permission: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}
