# Backend Architectural Rules

1. **Monorepo Boundaries**: Never import code directly between microservice apps. All shared functionality must be encapsulated in `libs/*`.
2. **Gateway Responsibility**: The API Gateway handles routing, auth/tenant extraction, and payload validation. It contains **no business logic**.
3. **Inter-Service Communication**: Microservices communicate exclusively over RabbitMQ via defined message patterns in `@tribyte/types`.
4. **Database Segregation**:
   - Platform state, tenant catalogs, and subscriptions reside in the **Super Database**.
   - Tenant-specific business data resides in dedicated **Tenant Databases** (`tenant_<slug>`).
5. **Structured Logging**: All logging must pass through `AppLoggerService` with request and correlation identifiers.
