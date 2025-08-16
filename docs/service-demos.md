# Service Demonstrations - Implementation Guide

This document provides **technical implementation details** for existing service demonstration MFEs. For roadmap and planning information, see [ROADMAP.md](./ROADMAP.md).

## Overview

Service demos are working examples that showcase the platform's shared services across different frameworks. They demonstrate real-world integration patterns and best practices.

## Notification Service Demos (Completed)

**Status**: ✅ Complete - All frameworks implemented

Located in `apps/service-demos/notifications/`

### Implementations

| MFE Name                    | Framework      | Features                                        |
|-----------------------------|----------------|------------------------------------------------|
| `mfe-notification-react19`  | React 19.0.0   | Full notification testing suite               |
| `mfe-notification-react18`  | React 18.2.0   | Cross-version compatibility demo              |
| `mfe-notification-react17`  | React 17.0.2   | Legacy React support demonstration            |
| `mfe-notification-vue3`     | Vue 3.4.0      | Vue Composition API integration               |
| `mfe-notification-solidjs`  | Solid.js 1.8.0 | Fine-grained reactivity example               |
| `mfe-notification-vanilla`  | Vanilla TS     | Framework-agnostic implementation             |

### Key Features Demonstrated

1. **Notification Types** - Success, Error, Warning, Info messages
2. **Duration Control** - Short (1s), Normal (3s), Long (10s), Persistent options
3. **Custom Notifications** - Form-based custom message creation
4. **Batch Operations** - Show multiple notifications, clear all functionality
5. **Cross-Framework Consistency** - Identical UX across all frameworks
6. **MFEModule Pattern** - Standardized module export structure

### Usage Pattern

```typescript
// Service injection pattern for notifications
const { notification } = services;

// Show notification
notification.show({
  title: 'Success!',
  message: 'Operation completed',
  type: 'success',
  duration: 3000 // optional, in milliseconds
});

// Clear all notifications
notification.clear();
```

**Notification Demo**: http://localhost:3000/services/notifications

## Modal Service Demos (Planned)

**Status**: Planned for Q1 2025 - See [ROADMAP.md](./ROADMAP.md#modal-service-demos) for details.

### Usage Pattern (When Implemented)

```typescript
// Service injection pattern for modal usage
const { modal, notification } = services;

// Simple alert
modal.open({
  title: 'Alert',
  content: 'This is a simple alert',
  actions: [{ label: 'OK', variant: 'default' }],
});

// Confirmation dialog
const result = await modal.confirm({
  title: 'Confirm Action',
  content: 'Are you sure?',
});
```

## Event Bus Service Demos (Completed)

Located in `apps/service-demos/event-bus/`

### Trading Scenario Implementation

**Path**: `apps/service-demos/event-bus/scenarios/trading/`

| MFE Name               | Framework   | Purpose                                          |
| ---------------------- | ----------- | ------------------------------------------------ |
| `mfe-market-watch`     | React 18    | Real-time stock ticker with price updates       |
| `mfe-trading-terminal` | Vue 3       | Order placement and portfolio management        |
| `mfe-analytics-engine` | Vanilla TS  | Performance metrics and portfolio analysis      |

### Interactive Tools

**Path**: `apps/service-demos/event-bus/`

| MFE Name               | Framework   | Purpose                                          |
| ---------------------- | ----------- | ------------------------------------------------ |
| `mfe-event-playground` | Solid.js    | Interactive event testing and debugging tool    |

### Key Features Demonstrated

1. **Cross-Framework Communication** - React, Vue, Solid.js, and Vanilla TS MFEs communicating seamlessly
2. **Real-Time Data Sync** - Market data updates propagated across all MFEs
3. **Event-Driven Architecture** - Decoupled MFEs using pub/sub pattern
4. **Service Injection** - No global pollution, services injected at mount time

### Common Event Patterns

```typescript
// Subscribe to events
const unsubscribe = eventBus.on('user:login', (data) => {
  console.log('User logged in:', data);
});

// Emit events
eventBus.emit('theme:change', { theme: 'dark' });

// Cleanup
unsubscribe();
```

### Trading Scenario Events

- `market:update` - Real-time price updates
- `order:placed` / `order:filled` - Trading actions
- `portfolio:update` - Portfolio value changes
- `analytics:metrics` - Performance calculations

## Running Service Demos

```bash
# Build and serve
pnpm build
pnpm serve        # Terminal 1: Serves MFEs on :8080
pnpm dev:container-react  # Terminal 2: Container on :3000
```

**Event Bus Demo**: http://localhost:3000/services/event-bus

## Implementation Patterns

### Service Injection Pattern

```typescript
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';

const mfeDemo: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    const { eventBus, logger } = services;
    // Implementation
    return () => {/* cleanup */};
  },
  unmount: () => {/* additional cleanup */}
};

export default mfeDemo;
```

### Build Configuration

Service demos use either tsup (recommended) or esbuild:

```javascript
// tsup.config.js (recommended)
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: 'esm',
  external: ['react', 'react-dom', 'vue', 'solid-js'],
  minify: true,
  target: 'es2020'
});

// Or build.js with esbuild (for Vue compatibility)
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'esm',
  external: ['react', 'react-dom', 'vue'],
  minify: true,
  outfile: 'dist/mfe.js'
});
```

### Registry Entry Example

```json
{
  "name": "mfe-trading-terminal",
  "url": "http://localhost:8080/service-demos/event-bus/scenarios/trading/mfe-trading-terminal/dist/mfe-trading-terminal.js",
  "framework": "vue3"
}
```

## Creating New Service Demos

### Quick Start

```bash
# 1. Create MFE directory
mkdir -p apps/service-demos/event-bus/mfe-{framework}-demo

# 2. Add package.json with build script
# 3. Create tsup.config.js (or build.js for Vue)
# 4. Implement src/main.ts with MFEModule export
# 5. Add to mfe-registry.json
# 6. Build and test
pnpm build && pnpm serve
```

## Best Practices

1. **Bundle Size**: Mark framework dependencies as external
2. **Type Safety**: Use `MFEModule` type from `@mfe-toolkit/core`
3. **Cleanup**: Remove event listeners and subscriptions in unmount
4. **Styling**: Use design system `ds-*` classes (500+ utilities available)
5. **Error Handling**: Check service availability before use
6. **Build Tool**: Prefer tsup, use esbuild for Vue if needed

## Troubleshooting

### Common Issues

1. **"process is not defined"**: Add `define: { 'process.env': {} }` to build config
2. **Framework not found**: Ensure framework is in container's import map and marked as external
3. **Large bundle**: Check externals configuration
4. **Build errors**: Use tsup for React/Solid.js, esbuild with Vue plugin for Vue

### Verification

```bash
# Check bundle size (should be < 15KB)
ls -lh dist/*.js
```

## Future Enhancements

See [ROADMAP.md](./ROADMAP.md#active-development-q1-2025) for the complete list of planned service demos and their timeline.

## Related Documentation

- [ROADMAP.md](./ROADMAP.md) - Platform roadmap and planning
- [CLAUDE.md](../CLAUDE.md) - Development guidelines
- [Architecture Decisions](./architecture/architecture-decisions.md)
