import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigModule, TenantContextGuard, AppLoggerService, QueueNames } from '@tribyte/common';
import { HealthController } from './health.controller';
import { AuthGatewayController } from './auth.controller';
import { TenantGatewayController } from './tenant.controller';
import { CatalogGatewayController } from './catalog.controller';
import { LogsGatewayController } from './logs.controller';
import { SettingsGatewayController } from './settings.controller';
import { SuperUserGatewayController } from './super-user.controller';
import { CompanyAuthGatewayController } from './company-auth.controller';
import { CompanyProfileGatewayController } from './company-profile.controller';
import { OrgStructureGatewayController } from './org-structure.controller';
import { CompanyUserMgmtGatewayController } from './company-user-mgmt.controller';
import { CompanyPolicyGatewayController } from './company-policy.controller';
import { CompanyReportsGatewayController } from './company-reports.controller';
import { UserGatewayController } from './user.controller';

@Module({
  imports: [
    AppConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret_key',
    }),
    ClientsModule.register([
      {
        name: QueueNames.AUTH_QUEUE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || 'amqp://guest:guest@127.0.0.1:5672'],
          queue: QueueNames.AUTH_QUEUE,
          queueOptions: { durable: true },
        },
      },
      {
        name: QueueNames.TENANT_QUEUE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || 'amqp://guest:guest@127.0.0.1:5672'],
          queue: QueueNames.TENANT_QUEUE,
          queueOptions: { durable: true },
        },
      },
      {
        name: QueueNames.USER_QUEUE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || 'amqp://guest:guest@127.0.0.1:5672'],
          queue: QueueNames.USER_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [
    HealthController,
    AuthGatewayController,
    TenantGatewayController,
    CatalogGatewayController,
    LogsGatewayController,
    SettingsGatewayController,
    SuperUserGatewayController,
    CompanyAuthGatewayController,
    CompanyProfileGatewayController,
    OrgStructureGatewayController,
    CompanyUserMgmtGatewayController,
    CompanyPolicyGatewayController,
    CompanyReportsGatewayController,
    UserGatewayController,
  ],
  providers: [
    AppLoggerService,
    {
      provide: APP_GUARD,
      useClass: TenantContextGuard,
    },
  ],
})
export class AppModule {}
