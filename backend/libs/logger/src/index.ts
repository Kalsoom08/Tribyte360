import { Injectable, LoggerService } from '@nestjs/common';
import { RequestContext } from '@tribyte/types';

@Injectable()
export class AppLoggerService implements LoggerService {
  private serviceName: string = 'backend-service';

  setServiceName(name: string) {
    this.serviceName = name;
  }

  private formatMessage(
    level: string,
    message: any,
    context?: string,
    reqCtx?: Partial<RequestContext>,
  ) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      context: context || 'Application',
      correlationId: reqCtx?.correlationId,
      tenantId: reqCtx?.tenantId,
      userId: reqCtx?.userId,
      message,
    });
  }

  log(message: any, context?: string, reqCtx?: Partial<RequestContext>) {
    console.log(this.formatMessage('INFO', message, context, reqCtx));
  }

  error(message: any, trace?: string, context?: string, reqCtx?: Partial<RequestContext>) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        service: this.serviceName,
        context: context || 'Application',
        correlationId: reqCtx?.correlationId,
        tenantId: reqCtx?.tenantId,
        userId: reqCtx?.userId,
        message,
        stack: trace,
      }),
    );
  }

  warn(message: any, context?: string, reqCtx?: Partial<RequestContext>) {
    console.warn(this.formatMessage('WARN', message, context, reqCtx));
  }

  debug(message: any, context?: string, reqCtx?: Partial<RequestContext>) {
    console.debug(this.formatMessage('DEBUG', message, context, reqCtx));
  }
}
