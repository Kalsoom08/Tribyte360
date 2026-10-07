# Tribyte360 — Super Admin Panel Backend Documentation

## 1. Overview

The **Super Admin Panel** is the control hub for the Tribyte360 ERP platform.

It allows the platform operators (Tribyte Solutions team) to:
- Register and manage all tenant companies (`Devsinc`, `Acme Corp`, etc.)
- Operate secure platform-level authentication and authorization
- Define and assign subscription plans and business modules
- Audit every activity across all tenants and services
- Configure the platform's global settings and behavior

All Super Admin data resides in the **Super Database (`super_db`)**, keeping it fully isolated from tenant business data.

---

## 2. Architecture Flow

```text
Super Admin User
     │
     ▼
REST → API Gateway (:3000)
     │  → GlobalValidationPipe
     │  → TenantContextGuard (adds correlationId, requestId)
     │  → SuperAuthGuard (verifies JWT)
     │  → PermissionsGuard (RBAC via @RequirePermissions)
     ▼
RabbitMQ (`tenant_queue`, `auth_queue`)
     │
     ▼
Auth Service (:3001)
     │  → AuthService / TenantService / CatalogService
     │  → LogsService / SettingsService / SuperUserService
     ▼
MongoDB `super_db` collections:
     ├── super_users
     ├── super_roles
     ├── super_permissions
     ├── tenants
     ├── module_catalogs
     ├── subscription_plans
     ├── activity_logs
     ├── error_logs
     └── app_settings