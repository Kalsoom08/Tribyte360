# Component Reusability Guidelines

1. **Check First**: Before creating any new UI component, verify if a suitable candidate exists in `packages/ui`.
2. **Generic vs Domain**:
   - Generic (Buttons, Modals, Cards, Badges) -> `packages/ui`
   - Domain-specific (AMS AssetTimeline, TenantBillingCard) -> `apps/<app>/components/*`
