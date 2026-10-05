import { Module } from '@nestjs/common';
import { AppConfigModule, AppLoggerService, ConnectionManagerService } from '@tribyte/common';
import { AuthMessageController } from './auth.controller';

@Module({
  imports: [AppConfigModule],
  controllers: [AuthMessageController],
  providers: [AppLoggerService, ConnectionManagerService],
})
export class AppModule {}
