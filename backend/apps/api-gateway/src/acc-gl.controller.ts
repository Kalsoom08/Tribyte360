import { Controller, Post, Get, Body, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant, TenantUserAuthGuard, CurrentTenantUser } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { CreateGlAccountDto, CreateJournalEntryDto } from './dto/create-accounting.dto';

@Controller('accounting')
@UseGuards(TenantUserAuthGuard)
export class AccGlGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  // Chart of Accounts
  @Post('gl-accounts')
  async createGlAccount(@Body() dto: CreateGlAccountDto, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_GL_ACCOUNT_CREATE, { tenantSlug, payload: dto, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('gl-accounts')
  async findAllGlAccounts(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_GL_ACCOUNT_FIND_ALL, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  // Journal Entries
  @Post('journal-entries')
  async createJournalEntry(@Body() dto: CreateJournalEntryDto, @CurrentTenantUser() user: any, @CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const postedByUserId = user?.sub || user?.id;
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_JOURNAL_ENTRY_CREATE, { tenantSlug, postedByUserId, payload: dto, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }

  @Get('journal-entries')
  async findAllJournalEntries(@CurrentTenant() tenantSlug: string, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.ACC_JOURNAL_ENTRY_FIND_ALL, { tenantSlug, context: ctx }),
    );
    return { success: true, data: result, correlationId: ctx.correlationId, timestamp: new Date().toISOString() };
  }
}
