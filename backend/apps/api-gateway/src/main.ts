import { NestFactory } from '@nestjs/core';
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
  logger.log(`API Gateway running on port ${port}`, 'Bootstrap');
}
bootstrap();
