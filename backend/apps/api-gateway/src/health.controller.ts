import { Controller, Get } from '@nestjs/common';
import { ReqContext } from '@tribyte/auth';
import { RequestContext, ApiResponse } from '@tribyte/types';

@Controller('health')
export class HealthController {
  @Get()
  check(@ReqContext() ctx: RequestContext): ApiResponse {
    return {
      success: true,
      data: {
        status: 'UP',
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
      },
      correlationId: ctx?.correlationId || 'root',
      timestamp: new Date().toISOString(),
    };
  }
}
