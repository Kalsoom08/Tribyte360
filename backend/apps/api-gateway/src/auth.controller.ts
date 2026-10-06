import { Controller, Post, Get, Body, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, SuperAuthGuard, RequirePermissions, PermissionsGuard, CurrentUser } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthGatewayController {
  constructor(@Inject(QueueNames.AUTH_QUEUE) private readonly authClient: ClientProxy) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.authClient.send(MessagePatterns.AUTH_LOGIN, { payload: loginDto, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me')
  @UseGuards(SuperAuthGuard, PermissionsGuard)
  @RequirePermissions('users.manage')
  async getProfile(@CurrentUser() user: any, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        message: 'Access granted to protected Super Admin profile',
        user,
      },
      correlationId: ctx?.correlationId || 'root',
      timestamp: new Date().toISOString(),
    };
  }
}
