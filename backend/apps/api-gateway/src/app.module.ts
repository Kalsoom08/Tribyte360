import { Module } from '@nestjs/common';
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
