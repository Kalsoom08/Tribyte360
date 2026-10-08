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
  // Auth & Internal Users (Super Admin)
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

  // Company Admin Panel
  TENANT_AUTH_LOGIN = 'tenant_auth.login',
  COMPANY_PROFILE_GET = 'company.profile_get',
  COMPANY_PROFILE_UPDATE = 'company.profile_update',
  DEPARTMENT_CREATE = 'org.department_create',
  DEPARTMENT_FIND_ALL = 'org.department_find_all',
  DESIGNATION_CREATE = 'org.designation_create',
  DESIGNATION_FIND_ALL = 'org.designation_find_all',
  BRANCH_CREATE = 'org.branch_create',
  BRANCH_FIND_ALL = 'org.branch_find_all',
  COST_CENTER_CREATE = 'org.cost_center_create',
  COST_CENTER_FIND_ALL = 'org.cost_center_find_all',
  TENANT_ROLE_CREATE = 'company.role_create',
  TENANT_ROLE_FIND_ALL = 'company.role_find_all',
  TENANT_USER_CREATE = 'company.user_create',
  TENANT_USER_FIND_ALL = 'company.user_find_all',
  TENANT_USER_GET_BY_ID = 'company.user_get_by_id',
  COMPANY_POLICY_GET = 'company.policy_get',
  COMPANY_POLICY_UPDATE = 'company.policy_update',
  COMPANY_AUDIT_SETTINGS_GET = 'company.audit_settings_get',
  COMPANY_AUDIT_SETTINGS_UPDATE = 'company.audit_settings_update',
  COMPANY_DASHBOARD_SUMMARY = 'company.dashboard_summary',

  // HR Panel — Employee Management
  HR_EMPLOYEE_CREATE = 'hr.employee_create',
  HR_EMPLOYEE_FIND_ALL = 'hr.employee_find_all',
  HR_EMPLOYEE_GET_BY_ID = 'hr.employee_get_by_id',
  HR_EMPLOYEE_UPDATE_STATUS = 'hr.employee_update_status',
  HR_CONTRACT_CREATE = 'hr.contract_create',

  // Users
  USER_GET_BY_ID = 'user.get_by_id',
  USER_FIND_ALL = 'user.find_all',
  USER_CREATE = 'user.create',
}
