import { NestFactory } from '@nestjs/core';
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
