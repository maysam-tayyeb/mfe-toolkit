# Service Extraction Plan

## Status: In Progress
**Branch:** `feature/extract-services`  
**Started:** January 2025

## Overview

This document outlines the plan to extract all services (except logger) from `@mfe-toolkit/core` into separate, tree-shakable npm packages. Each service package will use TypeScript module augmentation to extend the ServiceMap interface.

## Goals

1. **Tree-shakability**: Only imported services are bundled
2. **Zero runtime cost**: MFEs importing only types get no implementation code
3. **Type safety**: Non-optional services ensure containers provide all required services
4. **Extensibility**: Easy to add new services via packages or CLI
5. **Override capability**: Services can be easily replaced (e.g., pino logger)

## Architecture

### Current State
All services are consolidated in `@mfe-toolkit/core`:
- Service interfaces in `src/services/types/`
- Implementations in `src/services/implementations/`
- ServiceMap includes all services (some optional)

### Target State
- `@mfe-toolkit/core` contains only Logger service
- Each service in its own package: `@mfe-toolkit/service-{name}`
- Services extend ServiceMap via module augmentation
- Services are non-optional in ServiceMap

## Service Packages to Create

| Package | Description | Status |
|---------|-------------|--------|
| `@mfe-toolkit/service-event-bus` | Event bus for inter-MFE communication | Pending |
| `@mfe-toolkit/service-error-reporter` | Error tracking and reporting | Pending |
| `@mfe-toolkit/service-modal` | Modal UI management | Pending |
| `@mfe-toolkit/service-notification` | Toast notifications | Pending |
| `@mfe-toolkit/service-auth` | Authentication service | Pending |
| `@mfe-toolkit/service-authz` | Authorization service | Pending |
| `@mfe-toolkit/service-theme` | Theme management | Pending |
| `@mfe-toolkit/service-analytics` | Analytics tracking | Pending |

## Package Structure

Each service package follows this structure:
```
packages/mfe-toolkit-service-{name}/
├── src/
│   ├── index.ts           # Exports and module augmentation
│   ├── types.ts           # Service interface
│   ├── implementation.ts  # Default implementation
│   └── provider.ts        # Service provider for lazy init
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Module Augmentation Pattern

Each service extends ServiceMap:
```typescript
// @mfe-toolkit/service-modal/src/index.ts
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    modal: ModalService;  // Non-optional
  }
}
```

## CLI Updates

### New Command: `create-service`
Creates a new service package with proper structure:
```bash
pnpm mfe-toolkit create-service notification
```

### Updated MFE Templates
All MFE templates updated to use new service architecture:
- Import only needed service types (zero runtime)
- Proper service access patterns
- TypeScript support

## Logger Override Demo

Demonstrate service override capability with pino:
```typescript
// container-react/src/services/pino-logger.ts
class PinoLogger implements Logger {
  // Pino implementation
}

// Override in container
container.register('logger', new PinoLogger());
```

## Migration Steps

### Phase 1: Setup ✓
- [x] Create feature branch
- [x] Create this documentation

### Phase 2: CLI Enhancement
- [ ] Add `create-service` command
- [ ] Update all MFE templates

### Phase 3: Service Extraction
- [ ] Extract EventBus service
- [ ] Extract ErrorReporter service
- [ ] Extract Modal service
- [ ] Extract Notification service
- [ ] Extract Auth service
- [ ] Extract Authz service
- [ ] Extract Theme service
- [ ] Extract Analytics service

### Phase 4: Core Updates
- [ ] Remove extracted services from core
- [ ] Keep only Logger in ServiceMap
- [ ] Update exports and tests

### Phase 5: Container Updates
- [ ] Implement pino logger override
- [ ] Update service imports
- [ ] Test all services

### Phase 6: Testing & Documentation
- [ ] Run all tests
- [ ] Update documentation
- [ ] Create migration guide

## Benefits

1. **Reduced Bundle Size**: Only used services are included
2. **Better Type Safety**: Non-optional services ensure proper implementation
3. **Easier Testing**: Services can be tested in isolation
4. **Version Independence**: Services can be versioned separately
5. **Custom Services**: Easy to create custom service packages

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing MFEs | Compatibility layer during migration |
| Complex TypeScript setup | Clear documentation and examples |
| Package management overhead | CLI automation for creation |

## Success Criteria

- [ ] All services extracted to separate packages
- [ ] CLI templates updated and working
- [ ] Pino logger override functional
- [ ] All tests passing
- [ ] Zero runtime cost verified
- [ ] Tree-shaking confirmed
- [ ] Documentation complete

## Notes

- Services are non-optional in ServiceMap to ensure type safety
- Container must provide all services that MFEs depend on
- MFEs should only import types for zero runtime cost
- Implementation imports only needed in container