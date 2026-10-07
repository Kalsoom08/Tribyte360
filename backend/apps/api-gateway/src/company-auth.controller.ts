import { Controller, Post, Body, Inject, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { TenantLoginDto } from './dto/tenant-login.dto';

@Controller('company/auth')
export class CompanyAuthGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  @Post('login')
  async login(
    @Body() dto: TenantLoginDto,
    @CurrentTenant() tenantSlug: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    if (!tenantSlug) {
      throw new BadRequestException('x-tenant-id header is required for tenant login');
    }

    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.TENANT_AUTH_LOGIN, { tenantSlug, payload: dto, context: ctx }),
    );

    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }
}
