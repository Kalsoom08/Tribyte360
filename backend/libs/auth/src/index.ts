import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestContext } from '@tribyte/types';
import { generateCorrelationId, generateRequestId } from '@tribyte/utils';

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
