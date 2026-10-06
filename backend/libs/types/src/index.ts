export interface RequestContext {
  correlationId: string;
  requestId: string;
  tenantId?: string;
  userId?: string;
  language: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  correlationId: string;
  timestamp: string;
}

export enum QueueNames {
  AUTH_QUEUE = 'auth_queue',
  USER_QUEUE = 'user_queue',
  TENANT_QUEUE = 'tenant_queue',
}

export enum MessagePatterns {
  // Auth & Internal Users
  AUTH_VALIDATE_TOKEN = 'auth.validate_token',
  AUTH_LOGIN = 'auth.login',
  SUPER_USER_CREATE = 'super_user.create',
  SUPER_USER_FIND_ALL = 'super_user.find_all',

  // Tenant Management (Super Admin)
  TENANT_CREATE = 'tenant.create',
  TENANT_FIND_ALL = 'tenant.find_all',
  TENANT_GET_BY_ID = 'tenant.get_by_id',
  TENANT_UPDATE_STATUS = 'tenant.update_status',
  TENANT_DELETE = 'tenant.delete',
  TENANT_RESET_ADMIN_PASSWORD = 'tenant.reset_admin_password',
  TENANT_BLOCK_ADMIN = 'tenant.block_admin',

  // Module & Plan Catalog
  MODULE_CREATE = 'module.create',
  MODULE_FIND_ALL = 'module.find_all',
  PLAN_CREATE = 'plan.create',
  PLAN_FIND_ALL = 'plan.find_all',
  TENANT_ASSIGN_MODULES = 'tenant.assign_modules',

  // Logs & Settings
  LOGS_FIND_ACTIVITY = 'logs.find_activity',
  LOGS_FIND_ERROR = 'logs.find_error',
  SETTINGS_GET = 'settings.get',
  SETTINGS_UPDATE = 'settings.update',

  // Users
  USER_GET_BY_ID = 'user.get_by_id',
  USER_FIND_ALL = 'user.find_all',
  USER_CREATE = 'user.create',
}
