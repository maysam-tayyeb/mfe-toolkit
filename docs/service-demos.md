# Service Demonstrations

This document provides an overview of all service demonstration MFEs that showcase the platform's shared services across different frameworks.

## Overview

The service demos illustrate how the platform's shared services work consistently across different frameworks (React 19, React 17, Vue 3, and Vanilla TypeScript). Following the removal of monolithic MFEs and the implementation of the new design system, these focused demos provide clear examples of service integration patterns.

## Modal Service Demos

Located in `apps/service-demos/modal/`

### Design System Integration

The Modal Service demo page uses the comprehensive design system with:
- `ds-hero` for gradient hero sections
- `ds-card` and `ds-card-padded` for content containers
- `ds-btn-primary`, `ds-btn-outline`, `ds-btn-ghost` for actions (500+ utility classes)
- `ds-tabs` and `ds-tab-active` for code example navigation
- `ds-modal-*` classes for modal styling
- `ds-badge-*` for status indicators
- Modern Blue & Slate color palette throughout

### Available Implementations

| Framework      | MFE Name                 | Bundle Size | Key Features                         | Limitations             |
| -------------- | ------------------------ | ----------- | ------------------------------------ | ----------------------- |
| **React 19**   | `mfe-react19-modal-demo` | ~12KB       | Full JSX support, all modal features | None                    |
| **React 17**   | `mfe-react17-modal-demo` | ~143KB      | Legacy React support                 | Plain text content only |
| **Vue 3**      | `mfe-vue3-modal-demo`    | ~7KB        | Cross-framework integration          | Plain text content only |
| **Vanilla TS** | `mfe-vanilla-modal-demo` | ~5KB        | Smallest bundle, no framework        | Plain text content only |

### Features Demonstrated

1. **Simple Alert** - Basic modal with customizable button
2. **Confirmation Dialog** - Two-button modal with callbacks
3. **Form Modal** - Demonstrates content limitations in cross-framework scenarios
4. **Custom Content** - Shows framework-specific content capabilities
5. **Error Example** - Modal with error variant and notification integration
6. **Multiple Notifications** - Triggers various notification types
7. **Nested Modals** - Demonstrates modal stacking (React 19 only)
8. **Size Variations** - Shows all modal sizes (sm, md, lg, xl)

### Usage Example

```typescript
// In any MFE
const { modal, notification } = services;

// Simple alert
modal.open({
  title: 'Alert',
  content: 'This is a simple alert',
  actions: [{ label: 'OK', variant: 'default', onClick: () => console.log('Closed') }],
});

// Confirmation dialog
const result = await modal.confirm({
  title: 'Confirm Action',
  content: 'Are you sure?',
  confirmLabel: 'Yes',
  cancelLabel: 'No',
});
```

### Cross-Framework Limitations

- **React 19**: Full capabilities - can pass JSX components as content
- **React 17, Vue 3, Vanilla TS**: Limited to plain text content when interacting with React 19 container
- All frameworks can use callbacks and promises normally

## Event Bus Service Demos ✅ COMPLETED

Located in `apps/service-demos/event-bus/`

### Available Implementations

| Framework      | MFE Name                    | Bundle Size | Key Features                                     |
| -------------- | --------------------------- | ----------- | ------------------------------------------------ |
| **React 19**   | `mfe-market-watch`          | ~8KB        | Real-time stock ticker with price updates       |
| **Vue 3**      | `mfe-trading-terminal`      | ~10KB       | Full order placement and portfolio management   |
| **Vanilla JS** | `mfe-analytics-engine`      | ~6KB        | Performance metrics and portfolio analysis      |
| **Solid.js**   | `mfe-event-playground`      | ~7KB        | Interactive event testing and debugging         |
| **React 19**   | `mfe-react19-eventbus-demo` | ~5.5KB      | Original interactive pub/sub demonstration      |

### Design System Integration

The Event Bus demo page leverages the expanded design system (400+ utilities):
- Responsive layout with `ds-page` and `ds-page-content` containers
- Event log using `ds-card-padded` and `ds-card-elevated` for depth
- Action buttons using `ds-btn-primary`, `ds-btn-secondary`, `ds-btn-outline` variants
- Status badges with `ds-badge-info`, `ds-badge-success`, `ds-badge-warning` classes
- Typography with `ds-section-title`, `ds-card-title`, and `ds-text-muted`
- Grid layouts using `ds-grid` and responsive `ds-md:grid-cols-*` classes
- Interactive states with `ds-hover-scale` and `ds-transition`

### Features Demonstrated

1. **Event Emission** - Emit predefined and custom events with compact button grid
2. **Event Subscription** - Subscribe/unsubscribe with visual pill badges
3. **Event Log** - Real-time display using the reusable EventLog component
4. **Custom Events** - Create and emit custom events with JSON data
5. **Cross-MFE Communication** - Container emitter section for boundary testing
6. **MFE Info Panel** - Details, capabilities, and quick actions in right sidebar

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

### Predefined Events

- `user:login` / `user:logout` - Authentication events
- `theme:change` - Theme switching
- `data:update` - Data synchronization
- `navigation:change` - Route changes
- `modal:open` - Modal triggers
- `notification:show` - Notification displays
- `settings:update` - Settings changes

## Running Service Demos

### Development Mode

```bash
# Build packages and all MFEs
pnpm build

# Serve MFEs (in one terminal)
pnpm serve

# Start container (in another terminal)
pnpm dev:container-react
```

### Accessing Demos

Once running, navigate to:

- **Modal Service Demo**: http://localhost:3000/services/modal
- **Event Bus Demo**: http://localhost:3000/services/event-bus

## Architecture

### Service Injection

Services are injected into MFEs at mount time, preventing global scope pollution:

```typescript
// MFE receives services during mount
export default {
  mount: (element: HTMLElement, services: MFEServices) => {
    const { modal, notification, eventBus, logger } = services;
    // Use services here
  },
  unmount: () => {
    // Cleanup
  },
};
```

### Build Configuration

All demos use ESBuild for optimal bundle sizes:

```javascript
// esbuild.config.js
{
  format: 'esm',
  external: ['react', 'react-dom', 'vue'], // Framework deps external
  minify: true,
  target: 'es2020'
}
```

### Registry Configuration

Service demos are registered in `mfe-registry.json`:

```json
{
  "name": "mfe-vue3-modal-demo",
  "version": "1.0.0",
  "url": "http://localhost:8080/service-demos/modal/mfe-vue3-modal-demo/mfe-vue3-modal-demo.js",
  "requirements": {
    "services": [
      { "name": "modal", "optional": false },
      { "name": "notification", "optional": false }
    ]
  }
}
```

## Adding New Service Demos

### 1. Create MFE Structure

```bash
mkdir -p apps/service-demos/{service-name}/mfe-{framework}-{service}-demo
```

### 2. Essential Files

- `package.json` - Dependencies and build scripts
- `esbuild.config.js` - Build configuration
- `src/main.ts(x)` - MFE entry point with MFEModule export
- `src/App.tsx/.vue/.ts` - Main component

### 3. MFE Module Pattern

```typescript
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';

const myServiceDemo: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    // Initialize and render
  },
  unmount: () => {
    // Cleanup
  },
};

export default myServiceDemo;
```

### 4. Build and Register

```bash
# Build all packages and MFEs
pnpm build

# Add to mfe-registry.json if needed
# Serve the MFEs
pnpm serve
```

## Best Practices

1. **Bundle Size**: Use ESBuild and mark framework dependencies as external
2. **Type Safety**: Always type as `MFEModule` from `@mfe-toolkit/core`
3. **Cleanup**: Properly cleanup in unmount (event listeners, subscriptions)
4. **Styling**: Use design system classes (`ds-*` prefix) from the 400+ utility set:
   - Buttons: `ds-btn-primary`, `ds-btn-secondary`, `ds-btn-outline`
   - Cards: `ds-card-padded`, `ds-card-elevated`
   - Typography: `ds-h1` through `ds-h4`, `ds-text-muted`
   - Layout: `ds-flex`, `ds-grid`, `ds-container`
   - Forms: `ds-input`, `ds-select`, `ds-checkbox`
   - Modals: `ds-modal-backdrop`, `ds-modal-header`, `ds-modal-body`
5. **Error Handling**: Gracefully handle service unavailability
6. **Documentation**: Include README explaining capabilities and limitations

## Troubleshooting

### Common Issues

1. **"process is not defined"**: Add `define: { 'process.env': {} }` to build config
2. **"Vue is not defined"**: Ensure Vue is in container's import map
3. **Large bundle size**: Check that framework deps are marked as external
4. **Styling issues**: Use theme-aware Tailwind classes, not custom colors

### Debug Commands

```bash
# Check bundle size
ls -lh dist/*.js

# Verify external deps
grep -o "^import.*from" dist/*.js | head -5

# Check for process references
grep "process\." dist/*.js
```

## Future Enhancements

Following the platform cleanup and expanded design system implementation (400+ utilities):

- [ ] Complete Dev Container for isolated MFE development
- [ ] Logger Service Demo (all frameworks) - Using `ds-code-block` for log display
- [ ] Auth Service Demo (all frameworks) - Using `ds-form-*` classes
- [ ] Error Reporter Demo - Using `ds-callout-danger` for error displays
- [ ] Notification Service Demo (standalone, all frameworks) - Using `ds-toast-*` classes
- [ ] Theme Service Demo (all frameworks) - Showcasing all `ds-*` utility classes
- [ ] Performance Monitoring Dashboard - Using `ds-metric-card` and `ds-progress`
- [ ] Cross-tab State Synchronization Demos - Using `ds-badge-*` for sync status

## Related Documentation

- [Modal Service API](./api/modal-service.md)
- [Event Bus API](./api/event-bus.md)
- [MFE Communication Guide](./mfe-communication-guide.md)
- [Architecture Decisions](./architecture/architecture-decisions.md)
