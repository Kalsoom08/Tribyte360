# Tribyte360 — Company Admin Panel Backend Documentation

## 1. Overview

The **Company Admin Panel** is the control center for individual enterprise tenants (e.g. `Acme Corp`, `TechCorp`) operating inside Tribyte360.

It allows company owners and authorized tenant administrators to:
- Configure company profile, address, business hours, and fiscal year.
- Build organization structure: Departments, Designations, Branches, Cost Centers.
- Onboard users, assign custom company roles, and link employees to departments.
- Configure company policies: Leave days, Attendance grace periods, Overtime rates, Expense limits.
- Manage compliance, audit settings, and view executive summary dashboards.

All Company Admin data resides strictly inside the tenant's isolated database (**`tenant_<slug>`**).

---

## 2. Company Admin Panel Feature Set

### 2.1 Company Setup & Tenant Authentication
- **Tenant Auth Login**: `POST /api/v1/company/auth/login` (Header: `x-tenant-id: <slug>`)
- **Get Company Profile**: `GET /api/v1/company/profile`
- **Update Company Profile**: `PATCH /api/v1/company/profile`

### 2.2 Organization Structure
- **Departments**: `POST/GET /api/v1/company/org/departments`
- **Designations**: `POST/GET /api/v1/company/org/designations`
- **Branches / Locations**: `POST/GET /api/v1/company/org/branches`
- **Cost Centers**: `POST/GET /api/v1/company/org/cost-centers`

### 2.3 User & Role Management
- **Company Custom Roles**: `POST/GET /api/v1/company/roles`
- **Onboard Company Users**: `POST/GET /api/v1/company/users`
- **User Details**: `GET /api/v1/company/users/:id`

### 2.4 Policy Configuration
- **Company Policies**: `GET/PATCH /api/v1/company/policies`
  - Leave Policy (`annualLeaveDays`, `sickLeaveDays`, `carryForwardMaxDays`)
  - Attendance Policy (`gracePeriodMinutes`, `halfDayThresholdHours`, `allowMobileClockIn`)
  - Overtime Policy (`rateMultiplier`, `maxMonthlyHours`, `requiresApproval`)
  - Expense Policy (`maxNoApprovalAmount`, `receiptRequiredThreshold`)

### 2.5 Compliance & Executive Reports
- **Audit Settings**: `GET/PATCH /api/v1/company/settings/audit`
- **Executive Dashboard Summary**: `GET /api/v1/company/reports/dashboard`