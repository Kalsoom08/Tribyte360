import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { LogsService } from './logs.service';

@Controller()
export class LogsMessageController {
  constructor(private readonly logsService: LogsService) {}

  @MessagePattern(MessagePatterns.LOGS_FIND_ACTIVITY)
  async handleFindActivityLogs(@Payload() data: { filter: any }) {
    return this.logsService.findActivityLogs(data.filter);
  }

  @MessagePattern(MessagePatterns.LOGS_FIND_ERROR)
  async handleFindErrorLogs() {
    return this.logsService.findErrorLogs();
  }
}
