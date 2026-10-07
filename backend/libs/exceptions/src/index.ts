import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '@tribyte/types';

export class AppException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = HttpStatus.BAD_REQUEST,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'AppException';
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request.headers['x-correlation-id'] as string) || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal error occurred';
    let details: any = undefined;

    if (exception instanceof AppException) {
      status = exception.statusCode;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      code = res.error || 'HTTP_EXCEPTION';
      message = typeof res === 'string' ? res : res.message || exception.message;
      details = res.details;
    } else if (exception && typeof exception === 'object' && (exception.statusCode || exception.status)) {
      // Handles NestJS Microservice RPC error payloads passed to Gateway
      status = typeof exception.statusCode === 'number' ? exception.statusCode : HttpStatus.BAD_REQUEST;
      code = exception.code || exception.error || 'MICROSERVICE_ERROR';
      message = exception.message || 'Microservice execution error';
      details = exception.details || exception.response;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const payload: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      correlationId,
      timestamp: new Date().toISOString(),
    };

    response.status(typeof status === 'number' ? status : 500).json(payload);
  }
}
