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
  // Auth
  AUTH_VALIDATE_TOKEN = 'auth.validate_token',
  AUTH_LOGIN = 'auth.login',

  // Tenant Management (Super Admin)
  TENANT_CREATE = 'tenant.create',
  TENANT_FIND_ALL = 'tenant.find_all',
  TENANT_GET_BY_ID = 'tenant.get_by_id',
  TENANT_UPDATE_STATUS = 'tenant.update_status',
  TENANT_DELETE = 'tenant.delete',
  TENANT_RESET_ADMIN_PASSWORD = 'tenant.reset_admin_password',
  TENANT_BLOCK_ADMIN = 'tenant.block_admin',

  // Users
  USER_GET_BY_ID = 'user.get_by_id',
  USER_FIND_ALL = 'user.find_all',
  USER_CREATE = 'user.create',
}
