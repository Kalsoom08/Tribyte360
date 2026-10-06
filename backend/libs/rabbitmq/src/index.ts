import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { QueueNames } from '@tribyte/types';

export function createRabbitMqClientConfig(queue: QueueNames, uri?: string): ClientProviderOptions {
  return {
    name: queue,
    transport: Transport.RMQ,
    options: {
      urls: [uri || process.env.RABBITMQ_URI || 'amqp://guest:guest@127.0.0.1:5672'],
      queue,
      queueOptions: {
        durable: true,
      },
    },
  };
}
