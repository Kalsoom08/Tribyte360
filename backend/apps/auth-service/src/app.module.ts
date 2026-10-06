import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule, AppLoggerService, ConnectionManagerService } from '@tribyte/common';
import { AuthMessageController } from './auth.controller';
import { TenantMessageController } from './tenant.controller';
import { CatalogMessageController } from './catalog.controller';
import { LogsMessageController } from './logs.controller';
import { SettingsMessageController } from './settings.controller';
import { SuperUserMessageController } from './super-user.controller';
import { AuthService } from './auth.service';
import { TenantService } from './tenant.service';
import { CatalogService } from './catalog.service';
import { LogsService } from './logs.service';
import { SettingsService } from './settings.service';
import { SuperUserService } from './super-user.service';
import { SeedService } from './seed.service';

@Module({
  imports: [
    AppConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret_key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    AuthMessageController,
    TenantMessageController,
    CatalogMessageController,
    LogsMessageController,
    SettingsMessageController,
    SuperUserMessageController,
  ],
  providers: [
    AppLoggerService,
    ConnectionManagerService,
    AuthService,
    TenantService,
    CatalogService,
    LogsService,
    SettingsService,
    SuperUserService,
    SeedService,
  ],
})
export class AppModule {}
