import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule, AppLoggerService, ConnectionManagerService } from '@tribyte/common';
import { AuthMessageController } from './auth.controller';
import { TenantMessageController } from './tenant.controller';
import { AuthService } from './auth.service';
import { TenantService } from './tenant.service';
import { SeedService } from './seed.service';

@Module({
  imports: [
    AppConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret_key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthMessageController, TenantMessageController],
  providers: [AppLoggerService, ConnectionManagerService, AuthService, TenantService, SeedService],
})
export class AppModule {}
