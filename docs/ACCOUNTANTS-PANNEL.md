# Tribyte360 — Accountants Panel Backend Documentation

## 1. Overview

The **Accountants Panel** is the financial engine operating inside each tenant's isolated database (`tenant_<slug>`).

It provides double-entry general ledger accounting, accounts receivable (invoicing), accounts payable (supplier bills), employee expense claims, automated HR payroll GL postings, and real-time financial statements (Profit & Loss and Balance Sheet).

---

## 2. Accountants Panel Feature Matrix

| Sub-Module | Capability | API Endpoint |
| :--- | :--- | :--- |
| **General Ledger** | Chart of Accounts | `POST/GET /api/v1/accounting/gl-accounts` |
| | Double-Entry Journal Entries | `POST/GET /api/v1/accounting/journal-entries` |
| **Accounts Receivable**| Customer Invoices & Billing | `POST/GET /api/v1/accounting/invoices` |
| | Record Invoice Payments | `PATCH /api/v1/accounting/invoices/:id/pay` |
| **Accounts Payable** | Supplier Bills | `POST/GET /api/v1/accounting/bills` |
| | Employee Expense Reimbursements | `POST/GET /api/v1/accounting/expenses` |
| | Approve Expense Claims | `PATCH /api/v1/accounting/expenses/:id/approve` |
| **HR Integration** | Auto-Post Payroll GL Journal Entry | `POST /api/v1/accounting/payroll/post-journal` |
| | Bank File Export (SEPA/ACH CSV) | `GET /api/v1/accounting/payroll/export-bank-file` |
| **Financial Statements**| Tax Configurations | `POST/GET /api/v1/accounting/taxes` |
| | Profit & Loss (P&L) Statement | `GET /api/v1/accounting/reports/profit-loss` |
| | Balance Sheet Statement | `GET /api/v1/accounting/reports/balance-sheet` |