# Tribyte360 — HR Panel Backend Documentation

## 1. Overview

The **HR Panel** is a core tenant-level module for managing employee lifecycles, attendance, leaves, payrolls, and performance reviews inside `tenant_<slug>` databases.

---

## 2. HR Panel Feature Matrix

| Sub-Module | Capability | API Endpoint |
| :--- | :--- | :--- |
| **Employee Mgmt** | Onboard Employee Profile & Contract | `POST /api/v1/hr/employees` |
| | Employee 360 View & Documents | `GET /api/v1/hr/employees/:id` |
| | Attrition & Headcount Stats | `GET /api/v1/hr/employees` |
| | Lifecycle Status Transition | `PATCH /api/v1/hr/employees/:id/status` |
| **Attendance** | Shift Scheduling | `POST/GET /api/v1/hr/shifts` |
| | Real-time Clock-In / Clock-Out | `POST /api/v1/hr/attendance/clock-in` / `clock-out` |
| | Daily Attendance Summary | `GET /api/v1/hr/attendance` |
| **Leave Mgmt** | Leave Allocations & Types | `POST/GET /api/v1/hr/leave-types` |
| | Submit Leave Request | `POST /api/v1/hr/leave-requests` |
| | Leave Approval Workflow | `PATCH /api/v1/hr/leave-requests/:id/status` |
| **Payroll Engine** | Salary Components (Allowances & Tax) | `POST/GET /api/v1/hr/payroll/components` |
| | Monthly Payroll Generator | `POST /api/v1/hr/payroll/generate` |
| | Approve & Pay Payroll | `PATCH /api/v1/hr/payroll/approve` |
| **Performance** | Submit Q4 Appraisal & KPIs | `POST/GET /api/v1/hr/appraisals` |
| | Executive HR Analytics Summary | `GET /api/v1/hr/reports/summary` |