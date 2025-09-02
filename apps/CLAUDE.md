# apps/CLAUDE.md

This file provides app-specific guidance to Claude Code when working with applications in this repository.

## Application Structure

### Container Application (`container-react/`)
- Main shell application that hosts and orchestrates MFEs
- React 19 + React Context + Tailwind CSS + ShadCN UI
- Provides shared services to all MFEs
- Dynamic MFE loading via ES modules (no Module Federation)

### Service Demos (`service-demos/`)
Demonstration MFEs showcasing various framework integrations and services.

## Creating New MFEs

### Setup Steps

1. Create new app in `apps/service-demos/` with naming convention `mfe-{name}`
2. Use the ServiceContainer pattern:

```typescript
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

const module: MFEModule = {
  mount: async (element: HTMLElement, container: ServiceContainer) => {
    // Access services through container
    const logger = container.get('logger');
    const eventBus = container.get('eventBus');
    
    // Always check service availability
    logger?.info('MFE mounted');
    
    // Handle optional services gracefully
    if (container.has('modal')) {
      const modal = container.get('modal');
      // Use modal service
    }
  },
  
  unmount: async (container: ServiceContainer) => {
    container.get('logger')?.info('MFE unmounted');
  }
};

export default module;
```

3. Create `build.js` using the buildMFE utility:

```javascript
import { buildMFE } from '@mfe-toolkit/core';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-name.js',
  manifestPath: './manifest.json'
});
```

4. Add to container's MFE registry (`container-react/public/mfe-registry.json`)

### Framework Support

- **React 17/18/19**: Full support with shared runtime
- **Vue 3**: Composition API with shared dependencies
- **Solid.js**: Fine-grained reactivity
- **Vanilla TypeScript**: Zero-dependency MFEs

All frameworks use shared dependencies via import map - no bundling of framework code.

## MFE Demo Applications

### Trading Platform Scenario
Located in `service-demos/event-bus/scenarios/trading/`:
- `mfe-market-watch`: Real-time market data (React)
- `mfe-trading-terminal`: Trading interface (Vue 3)
- `mfe-analytics-engine`: Analytics processor (Vanilla TS)

### Service Demonstrations
Located in `service-demos/`:
- Modal demos: React 17/18/19, Vue 3, Solid.js, Vanilla TS
- Notification demos: All framework variants
- Event playground: Solid.js interactive testing tool

## Container Services

Services provided by the container to all MFEs:

### Core Services
- **Logger**: Logging with levels (debug, info, warn, error)
- **EventBus**: Inter-MFE communication via pub/sub
- **ErrorReporter**: Error tracking and reporting

### UI Services
- **Modal**: Modal management
- **Notification**: Toast notifications
- **Theme**: Theme management

### Platform Services
- **Authentication**: Auth state management
- **Authorization**: Permission checks
- **Analytics**: Event tracking

## Service Injection Pattern

- Zero global/window pollution
- Services injected at mount time
- Framework-agnostic design
- Type-safe through TypeScript interfaces

## MFE Loading Architecture

1. Container fetches registry from JSON
2. MFEs served as ES modules from port 8080
3. Dynamic imports at runtime
4. Services injected during mount
5. Automatic cleanup on unmount

## Development Commands

```bash
# Start container
pnpm dev:container-react

# Serve MFEs (separate terminal)
pnpm serve

# Build all MFEs
pnpm build

# Test container
pnpm test:container
```

## Important Locations

- Container services: `container-react/src/services/`
- React contexts: `container-react/src/contexts/`
- MFE registry: `container-react/public/mfe-registry.json`
- Import maps: `container-react/index.html`

## Best Practices

- Always check service availability before use
- Handle unmounting properly to prevent memory leaks
- Use design system CSS classes only (no inline styles)
- Test MFE in isolation and integrated with container
- Keep MFEs lightweight - use shared dependencies