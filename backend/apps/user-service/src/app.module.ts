import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule, AppLoggerService, ConnectionManagerService, I18nService } from '@tribyte/common';
import { UserMessageController } from './user.controller';
import { TenantAuthMessageController } from './tenant-auth.controller';
import { CompanyProfileMessageController } from './company-profile.controller';
import { TenantAuthService } from './tenant-auth.service';
import { CompanyProfileService } from './company-profile.service';

@Module({
  imports: [
    AppConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret_key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UserMessageController, TenantAuthMessageController, CompanyProfileMessageController],
  providers: [
    AppLoggerService,
    ConnectionManagerService,
    I18nService,
    TenantAuthService,
    CompanyProfileService,
  ],
})
export class AppModule {}
