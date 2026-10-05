# ADR-003: Database-per-Tenant Strategy

## Status
Accepted

## Context
Strict data isolation is mandatory across distinct enterprise tenants.

## Decision
Implement a Database-per-Tenant MongoDB architecture managed by `ConnectionManagerService` in `@tribyte/database`.

## Consequences
- Physical data isolation per tenant.
- Super DB stores platform catalog and global tenant records.
