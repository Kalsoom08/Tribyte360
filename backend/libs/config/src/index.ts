import { Module } from '@nestjs/common';
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
