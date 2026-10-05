# Frontend AI Agent Directives

1. Check `packages/ui` before creating any new component.
2. Follow the Tailwind + shadcn/ui design tokens documented in `docs/DESIGN-SYSTEM.md`.
3. Keep apps strictly isolated. Do not import cross-app business components.
4. Use `@repo/api-client` for all backend REST API requests.
5. Use `@repo/tenant` for extracting tenant slugs from hostnames.
