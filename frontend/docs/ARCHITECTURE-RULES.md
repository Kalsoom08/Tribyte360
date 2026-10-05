# Frontend Architecture Directives

1. **Workspace Segregation**: Frontend is an independent Turborepo workspace.
2. **App Isolation**: Never cross-import domain code between `apps/ams`, `apps/admin`, and `apps/customer`.
3. **Shared Design System**: All generic UI components reside in `packages/ui` using shadcn/ui and Lucide React.
4. **Tenant Resolution**: Derivation of tenant slugs from hostnames occurs through `@repo/tenant`.
5. **API Client**: REST calls must route through `@repo/api-client`.
