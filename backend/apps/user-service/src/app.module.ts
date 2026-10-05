import { Module } from '@nestjs/common';
import { AppConfigModule, AppLoggerService, ConnectionManagerService, I18nService } from '@tribyte/common';
import { UserMessageController } from './user.controller';

@Module({
  imports: [AppConfigModule],
  controllers: [UserMessageController],
  providers: [AppLoggerService, ConnectionManagerService, I18nService],
})
export class AppModule {}
