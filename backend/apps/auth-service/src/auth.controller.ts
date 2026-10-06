import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, AppLoggerService } from '@tribyte/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthMessageController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly authService: AuthService,
  ) {
    this.logger.setServiceName('auth-service');
  }

  @MessagePattern(MessagePatterns.AUTH_LOGIN)
  async handleLogin(@Payload() data: { payload: any; context: any }) {
    this.logger.log('Processing authentication request in super_db', 'AuthService', data.context);
    
    const { email, password } = data.payload || {};
    return this.authService.login(email, password);
  }
}
