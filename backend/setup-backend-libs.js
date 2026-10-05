const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function write(filePath, content) {
  const fullPath = path.join(__dirname, filePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content);
  console.log(`Created: ${filePath}`);
}

console.log('--- Initializing Backend Shared Libraries ---');

// 1. @tribyte/types
write('libs/types/src/index.ts', `export interface RequestContext {
  correlationId: string;
  requestId: string;
  tenantId?: string;
  userId?: string;
  language: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  correlationId: string;
  timestamp: string;
}

export interface TenantMetadata {
  id: string;
  name: string;
  slug: string;
  databaseName: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING';
  createdAt: Date;
  updatedAt: Date;
}

export enum QueueNames {
  AUTH_QUEUE = 'auth_queue',
  USER_QUEUE = 'user_queue',
}

export enum MessagePatterns {
  AUTH_VALIDATE_TOKEN = 'auth.validate_token',
  AUTH_LOGIN = 'auth.login',
  USER_GET_BY_ID = 'user.get_by_id',
  USER_FIND_ALL = 'user.find_all',
  USER_CREATE = 'user.create',
}
`);

// 2. @tribyte/utils
write('libs/utils/src/index.ts', `import { randomUUID } from 'crypto';

export function generateCorrelationId(): string {
  return randomUUID();
}

export function generateRequestId(): string {
  return 'req_' + randomUUID().substring(0, 8);
}
`);

// 3. @tribyte/exceptions
write('libs/exceptions/src/index.ts', `import {
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

    response.status(status).json(payload);
  }
}
`);

// 4. @tribyte/logger
write('libs/logger/src/index.ts', `import { Injectable, LoggerService } from '@nestjs/common';
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
`);

// 5. @tribyte/config
write('libs/config/src/index.ts', `import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  superDbUri: string;
  rabbitmqUri: string;
  jwtSecret: string;
  logLevel: string;
  defaultLanguage: string;
}

export const appConfigFactory = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  superDbUri: process.env.SUPER_DB_URI || 'mongodb://localhost:27017/super_db',
  rabbitmqUri: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key',
  logLevel: process.env.LOG_LEVEL || 'debug',
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
});

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class AppConfigModule {}
`);

// 6. @tribyte/i18n
write('libs/i18n/src/index.ts', `import { Injectable } from '@nestjs/common';

const translations: Record<string, Record<string, string>> = {
  en: {
    'welcome': 'Welcome to Tribyte360',
    'unauthorized': 'Unauthorized access',
    'tenant_not_found': 'Tenant not found',
    'user_not_found': 'User not found',
  },
  de: {
    'welcome': 'Willkommen bei Tribyte360',
    'unauthorized': 'Unbefugter Zugriff',
    'tenant_not_found': 'Mandant nicht gefunden',
    'user_not_found': 'Benutzer nicht gefunden',
  },
  ur: {
    'welcome': 'ٹرائی بائٹ 360 میں خوش آمدید',
    'unauthorized': 'غیر مجاز رسائی',
    'tenant_not_found': 'ٹیننٹ نہیں ملا',
    'user_not_found': 'صارف نہیں ملا',
  },
};

@Injectable()
export class I18nService {
  translate(key: string, lang: string = 'en'): string {
    const activeLang = translations[lang] ? lang : 'en';
    return translations[activeLang][key] || key;
  }
}
`);

// 7. @tribyte/database
write('libs/database/src/index.ts', `import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import mongoose, { Connection, Model, Schema } from 'mongoose';

@Injectable()
export class ConnectionManagerService implements OnApplicationShutdown {
  private tenantConnections: Map<string, Connection> = new Map();
  private superConnection: Connection | null = null;

  async getSuperDatabaseConnection(uri?: string): Promise<Connection> {
    if (!this.superConnection) {
      const dbUri = uri || process.env.SUPER_DB_URI || 'mongodb://localhost:27017/super_db';
      this.superConnection = await mongoose.createConnection(dbUri).asPromise();
      console.log('Connected to Super Database:', dbUri);
    }
    return this.superConnection;
  }

  async getTenantDatabaseConnection(tenantSlug: string, baseMongoUri?: string): Promise<Connection> {
    if (this.tenantConnections.has(tenantSlug)) {
      return this.tenantConnections.get(tenantSlug)!;
    }

    const baseUrl = baseMongoUri || process.env.BASE_MONGO_URI || 'mongodb://localhost:27017';
    const tenantDbName = \`tenant_\${tenantSlug.toLowerCase()}\`;
    const fullUri = \`\${baseUrl}/\${tenantDbName}\`;

    const connection = await mongoose.createConnection(fullUri).asPromise();
    this.tenantConnections.set(tenantSlug, connection);
    console.log(\`Connected to Tenant Database: \${tenantDbName}\`);

    return connection;
  }

  async getTenantModel<T>(
    tenantSlug: string,
    modelName: string,
    schema: Schema<T>,
  ): Promise<Model<T>> {
    const connection = await this.getTenantDatabaseConnection(tenantSlug);
    return connection.models[modelName]
      ? (connection.models[modelName] as Model<T>)
      : connection.model<T>(modelName, schema);
  }

  async onApplicationShutdown() {
    if (this.superConnection) {
      await this.superConnection.close();
    }
    for (const [slug, conn] of this.tenantConnections) {
      await conn.close();
      console.log(\`Closed connection for tenant: \${slug}\`);
    }
  }
}
`);

// 8. @tribyte/rabbitmq
write('libs/rabbitmq/src/index.ts', `import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { QueueNames } from '@tribyte/types';

export function createRabbitMqClientConfig(queue: QueueNames, uri?: string): ClientProviderOptions {
  return {
    name: queue,
    transport: Transport.RMQ,
    options: {
      urls: [uri || process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672'],
      queue,
      queueOptions: {
        durable: true,
      },
    },
  };
}
`);

// 9. @tribyte/auth
write('libs/auth/src/index.ts', `import {
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
`);

// 10. @tribyte/validation
write('libs/validation/src/index.ts', `import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

export class GlobalValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      ...options,
    });
  }
}
`);

// 11. @tribyte/common
write('libs/common/src/index.ts', `export * from '@tribyte/types';
export * from '@tribyte/utils';
export * from '@tribyte/exceptions';
export * from '@tribyte/logger';
export * from '@tribyte/config';
export * from '@tribyte/i18n';
export * from '@tribyte/database';
export * from '@tribyte/rabbitmq';
export * from '@tribyte/auth';
export * from '@tribyte/validation';
`);

console.log('--- All Backend Libraries Successfully Created ---');