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

console.log('--- Wiring Backend Apps, Microservices & Docker ---');

// ==========================================
// 1. API GATEWAY
// ==========================================
write('apps/api-gateway/src/main.ts', `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter, GlobalValidationPipe, AppLoggerService } from '@tribyte/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new AppLoggerService();
  logger.setServiceName('api-gateway');

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new GlobalValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS for tenant subdomains
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(\`API Gateway running on port \${port}\`, 'Bootstrap');
}
bootstrap();
`);

write('apps/api-gateway/src/app.module.ts', `import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigModule, TenantContextGuard, AppLoggerService, QueueNames } from '@tribyte/common';
import { HealthController } from './health.controller';
import { AuthGatewayController } from './auth.controller';
import { UserGatewayController } from './user.controller';

@Module({
  imports: [
    AppConfigModule,
    ClientsModule.register([
      {
        name: QueueNames.AUTH_QUEUE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672'],
          queue: QueueNames.AUTH_QUEUE,
          queueOptions: { durable: true },
        },
      },
      {
        name: QueueNames.USER_QUEUE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672'],
          queue: QueueNames.USER_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [HealthController, AuthGatewayController, UserGatewayController],
  providers: [
    AppLoggerService,
    {
      provide: APP_GUARD,
      useClass: TenantContextGuard,
    },
  ],
})
export class AppModule {}
`);

write('apps/api-gateway/src/health.controller.ts', `import { Controller, Get } from '@nestjs/common';
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
`);

write('apps/api-gateway/src/auth.controller.ts', `import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthGatewayController {
  constructor(@Inject(QueueNames.AUTH_QUEUE) private readonly authClient: ClientProxy) {}

  @Post('login')
  async login(@Body() payload: any, @ReqContext() ctx: RequestContext): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.authClient.send(MessagePatterns.AUTH_LOGIN, { payload, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }
}
`);

write('apps/api-gateway/src/user.controller.ts', `import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReqContext, CurrentTenant } from '@tribyte/auth';
import { RequestContext, ApiResponse, QueueNames, MessagePatterns } from '@tribyte/common';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UserGatewayController {
  constructor(@Inject(QueueNames.USER_QUEUE) private readonly userClient: ClientProxy) {}

  @Get()
  async findAll(@ReqContext() ctx: RequestContext, @CurrentTenant() tenantId?: string): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.USER_FIND_ALL, { tenantId, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ReqContext() ctx: RequestContext,
    @CurrentTenant() tenantId?: string,
  ): Promise<ApiResponse> {
    const result = await firstValueFrom(
      this.userClient.send(MessagePatterns.USER_GET_BY_ID, { id, tenantId, context: ctx }),
    );
    return {
      success: true,
      data: result,
      correlationId: ctx.correlationId,
      timestamp: new Date().toISOString(),
    };
  }
}
`);

// ==========================================
// 2. AUTH SERVICE (RMQ Microservice)
// ==========================================
write('apps/auth-service/src/main.ts', `import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { QueueNames, AppLoggerService } from '@tribyte/common';

async function bootstrap() {
  const logger = new AppLoggerService();
  logger.setServiceName('auth-service');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672'],
      queue: QueueNames.AUTH_QUEUE,
      queueOptions: { durable: true },
    },
  });

  await app.listen();
  logger.log('Auth Microservice is listening on RabbitMQ queue: ' + QueueNames.AUTH_QUEUE, 'Bootstrap');
}
bootstrap();
`);

write('apps/auth-service/src/app.module.ts', `import { Module } from '@nestjs/common';
import { AppConfigModule, AppLoggerService, ConnectionManagerService } from '@tribyte/common';
import { AuthMessageController } from './auth.controller';

@Module({
  imports: [AppConfigModule],
  controllers: [AuthMessageController],
  providers: [AppLoggerService, ConnectionManagerService],
})
export class AppModule {}
`);

write('apps/auth-service/src/auth.controller.ts', `import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, AppLoggerService, ConnectionManagerService } from '@tribyte/common';

@Controller()
export class AuthMessageController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly connectionManager: ConnectionManagerService,
  ) {
    this.logger.setServiceName('auth-service');
  }

  @MessagePattern(MessagePatterns.AUTH_LOGIN)
  async handleLogin(@Payload() data: { payload: any; context: any }) {
    this.logger.log('Processing login request in Super DB context', 'AuthService', data.context);
    // Connects to platform-level Super Database
    const superConn = await this.connectionManager.getSuperDatabaseConnection();
    
    return {
      token: 'jwt_mock_token_sample',
      user: {
        email: data.payload?.email || 'admin@tribyte360.com',
        role: 'PLATFORM_ADMIN',
      },
      superDbStatus: superConn.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    };
  }
}
`);

// ==========================================
// 3. USER SERVICE (RMQ Microservice + Multi-tenant DB)
// ==========================================
write('apps/user-service/src/main.ts', `import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { QueueNames, AppLoggerService } from '@tribyte/common';

async function bootstrap() {
  const logger = new AppLoggerService();
  logger.setServiceName('user-service');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672'],
      queue: QueueNames.USER_QUEUE,
      queueOptions: { durable: true },
    },
  });

  await app.listen();
  logger.log('User Microservice is listening on RabbitMQ queue: ' + QueueNames.USER_QUEUE, 'Bootstrap');
}
bootstrap();
`);

write('apps/user-service/src/app.module.ts', `import { Module } from '@nestjs/common';
import { AppConfigModule, AppLoggerService, ConnectionManagerService, I18nService } from '@tribyte/common';
import { UserMessageController } from './user.controller';

@Module({
  imports: [AppConfigModule],
  controllers: [UserMessageController],
  providers: [AppLoggerService, ConnectionManagerService, I18nService],
})
export class AppModule {}
`);

write('apps/user-service/src/user.controller.ts', `import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, AppLoggerService, ConnectionManagerService, I18nService } from '@tribyte/common';

@Controller()
export class UserMessageController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly connectionManager: ConnectionManagerService,
    private readonly i18n: I18nService,
  ) {
    this.logger.setServiceName('user-service');
  }

  @MessagePattern(MessagePatterns.USER_FIND_ALL)
  async handleFindAll(@Payload() data: { tenantId?: string; context: any }) {
    const tenant = data.tenantId || 'default';
    this.logger.log(\`Acquiring connection pool for tenant: \${tenant}\`, 'UserService', data.context);
    
    // Acquires or retrieves cached isolated MongoDB connection for the tenant
    const tenantDb = await this.connectionManager.getTenantDatabaseConnection(tenant);

    return {
      tenantDatabase: tenantDb.name,
      users: [
        { id: 'usr_01', name: 'Alice Developer', tenant },
        { id: 'usr_02', name: 'Bob Engineer', tenant },
      ],
      localizedMessage: this.i18n.translate('welcome', data.context?.language),
    };
  }

  @MessagePattern(MessagePatterns.USER_GET_BY_ID)
  async handleGetById(@Payload() data: { id: string; tenantId?: string; context: any }) {
    const tenant = data.tenantId || 'default';
    this.logger.log(\`Fetching user \${data.id} in tenant: \${tenant}\`, 'UserService', data.context);

    return {
      id: data.id,
      name: 'Alice Developer',
      tenant,
      status: 'ACTIVE',
    };
  }
}
`);

// ==========================================
// 4. DOCKER & COMPOSE
// ==========================================
write('docker/docker-compose.yml', `version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: tribyte_mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=super_db

  rabbitmq:
    image: rabbitmq:3.13-management
    container_name: tribyte_rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  mongo_data:
  rabbitmq_data:
`);

// ==========================================
// 5. DOCUMENTATION & ADRs
// ==========================================
write('docs/ARCHITECTURE-RULES.md', `# Backend Architectural Rules

1. **Monorepo Boundaries**: Never import code directly between microservice apps. All shared functionality must be encapsulated in \`libs/*\`.
2. **Gateway Responsibility**: The API Gateway handles routing, auth/tenant extraction, and payload validation. It contains **no business logic**.
3. **Inter-Service Communication**: Microservices communicate exclusively over RabbitMQ via defined message patterns in \`@tribyte/types\`.
4. **Database Segregation**:
   - Platform state, tenant catalogs, and subscriptions reside in the **Super Database**.
   - Tenant-specific business data resides in dedicated **Tenant Databases** (\`tenant_<slug>\`).
5. **Structured Logging**: All logging must pass through \`AppLoggerService\` with request and correlation identifiers.
`);

write('docs/decisions/ADR-001-initial-backend-architecture.md', `# ADR-001: Initial Backend Monorepo Architecture

## Status
Accepted

## Context
Tribyte360 requires a scalable, maintainable multi-tenant architecture supporting independent microservices.

## Decision
Adopt NestJS monorepo architecture with pnpm workspaces, utilizing an API Gateway and RabbitMQ message broker.

## Consequences
- Clean separation of concerns between ingress routing and domain services.
- Microservices scale horizontally independent of the gateway.
`);

write('docs/decisions/ADR-003-database-per-tenant.md', `# ADR-003: Database-per-Tenant Strategy

## Status
Accepted

## Context
Strict data isolation is mandatory across distinct enterprise tenants.

## Decision
Implement a Database-per-Tenant MongoDB architecture managed by \`ConnectionManagerService\` in \`@tribyte/database\`.

## Consequences
- Physical data isolation per tenant.
- Super DB stores platform catalog and global tenant records.
`);

write('docs/decisions/ADR-004-rabbitmq-service-communication.md', `# ADR-004: RabbitMQ Microservices Event Bus

## Status
Accepted

## Context
Direct HTTP coupling between services introduces tight coupling and cascade failures.

## Decision
Use RabbitMQ message patterns for asynchronous and RPC-style command execution between the API Gateway and backend domain services.
`);

console.log('--- Backend Wiring and Docs Successfully Configured ---');