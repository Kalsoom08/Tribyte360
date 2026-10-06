import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { QueueNames, AppLoggerService } from '@tribyte/common';

async function bootstrap() {
  const logger = new AppLoggerService();
  logger.setServiceName('auth-service');

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://guest:guest@127.0.0.1:5672'],
      queue: QueueNames.AUTH_QUEUE,
      queueOptions: { durable: true },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://guest:guest@127.0.0.1:5672'],
      queue: QueueNames.TENANT_QUEUE,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  logger.log('Auth & Platform Service listening on RabbitMQ Queues: auth_queue, tenant_queue', 'Bootstrap');
}
bootstrap();
