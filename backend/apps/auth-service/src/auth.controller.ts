import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, AppLoggerService, ConnectionManagerService } from '@tribyte/common';

@Controller()
export class AuthMessageController {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly connectionManager: ConnectionManagerService,
  ) {
    this.logger.setServiceName('auth-service');
  }

  @MessagePattern(MessagePatterns.AUTH_LOGIN)
  async handleLogin(@Payload() data: { payload: any; context: any }) {
    this.logger.log('Processing login request in Super DB context', 'AuthService', data.context);
    // Connects to platform-level Super Database
    const superConn = await this.connectionManager.getSuperDatabaseConnection();
    
    return {
      token: 'jwt_mock_token_sample',
      user: {
        email: data.payload?.email || 'admin@tribyte360.com',
        role: 'PLATFORM_ADMIN',
      },
      superDbStatus: superConn.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    };
  }
}
