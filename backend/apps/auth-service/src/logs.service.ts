import { Injectable } from '@nestjs/common';
import { ConnectionManagerService, ActivityLogSchema, ErrorLogSchema } from '@tribyte/common';

@Injectable()
export class LogsService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels() {
    const conn = await this.connectionManager.getSuperDatabaseConnection();
    const ActivityModel = conn.models['ActivityLog'] || conn.model('ActivityLog', ActivityLogSchema);
    const ErrorModel = conn.models['ErrorLog'] || conn.model('ErrorLog', ErrorLogSchema);
    return { ActivityModel, ErrorModel };
  }

  async recordActivity(logData: {
    actorEmail: string;
    action: string;
    module: string;
    entityType: string;
    entityId?: string;
    description: string;
    ipAddress?: string;
    correlationId?: string;
  }) {
    const { ActivityModel } = await this.getModels();
    return ActivityModel.create(logData);
  }

  async findActivityLogs(filter: any = {}) {
    const { ActivityModel } = await this.getModels();
    const query: any = {};
    if (filter.actorEmail) query.actorEmail = filter.actorEmail;
    if (filter.module) query.module = filter.module;
    if (filter.action) query.action = filter.action;

    const logs = await ActivityModel.find(query).sort({ createdAt: -1 }).limit(100);
    return { count: logs.length, logs };
  }

  async recordError(errorData: {
    statusCode: number;
    errorCode: string;
    message: string;
    path?: string;
    method?: string;
    stackTrace?: string;
    correlationId?: string;
    actorEmail?: string;
  }) {
    const { ErrorModel } = await this.getModels();
    return ErrorModel.create(errorData);
  }

  async findErrorLogs() {
    const { ErrorModel } = await this.getModels();
    const logs = await ErrorModel.find().sort({ createdAt: -1 }).limit(100);
    return { count: logs.length, logs };
  }
}
