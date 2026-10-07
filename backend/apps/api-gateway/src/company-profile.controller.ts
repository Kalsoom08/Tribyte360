import { Controller, Get, Patch, Body, Inject, UseGuards, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant, TenantUserAuthGuard } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';

@Controller('company/profile')
@UseGuards(TenantUserAuthGuard)
export class CompanyProfileGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  @Get()
  async getProfile(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    if (!tenantSlug) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.COMPANY_PROFILE_GET, { tenantSlug, context: ctx }),
    );

    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch()
  async updateProfile(
    @Body() dto: UpdateCompanyProfileDto,
    @CurrentTenant() tenantSlug: string,
    @ReqContext() ctx: RequestContext,
  ): Promise<ApiResponse> {
    if (!tenantSlug) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.COMPANY_PROFILE_UPDATE, { tenantSlug, updateData: dto, context: ctx }),
    );

    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }
}
