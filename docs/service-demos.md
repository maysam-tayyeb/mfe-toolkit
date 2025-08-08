# Service Demonstrations

This document provides an overview of all service demonstration MFEs that showcase the platform's shared services across different frameworks.

## Overview

The service demos illustrate how the platform's shared services work consistently across different frameworks (React 19, React 17, Vue 3, and Vanilla TypeScript). Each service has dedicated demo MFEs that demonstrate both capabilities and limitations.

## Modal Service Demos

Located in `apps/service-demos/modal/`

### UI/UX Improvements

The Modal Service demo page features a refined layout design:

1. **Improved Hero Section** - Features informative highlights instead of duplicate action buttons:
   - Framework Agnostic capabilities across React, Vue, and Vanilla JS
   - Consistent API interface across all MFEs
   - Zero Pollution through service injection (no global variables)
2. **Single Demo Section** - Clean "Try It Yourself" area with all modal examples
3. **Enhanced Information Architecture** - Better separation between features, demos, code examples, and framework implementations
4. **Tabbed Interface** - Code examples organized in tabs for different modal patterns
5. **Framework Selector** - Interactive selection for different framework implementations

### Available Implementations

| Framework | MFE Name | Bundle Size | Key Features | Limitations |
|-----------|----------|-------------|--------------|-------------|
| **React 19** | `mfe-react19-modal-demo` | ~12KB | Full JSX support, all modal features | None |
| **React 17** | `mfe-react17-modal-demo` | ~143KB | Legacy React support | Plain text content only |
| **Vue 3** | `mfe-vue3-modal-demo` | ~7KB | Cross-framework integration | Plain text content only |
| **Vanilla TS** | `mfe-vanilla-modal-demo` | ~5KB | Smallest bundle, no framework | Plain text content only |

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
  actions: [
    { label: 'OK', variant: 'default', onClick: () => console.log('Closed') }
  ]
});

// Confirmation dialog
const result = await modal.confirm({
  title: 'Confirm Action',
  content: 'Are you sure?',
  confirmLabel: 'Yes',
  cancelLabel: 'No'
});
```

### Cross-Framework Limitations

- **React 19**: Full capabilities - can pass JSX components as content
- **React 17, Vue 3, Vanilla TS**: Limited to plain text content when interacting with React 19 container
- All frameworks can use callbacks and promises normally

## Event Bus Service Demo

Located in `apps/service-demos/event-bus/`

### Available Implementation

| Framework | MFE Name | Bundle Size | Key Features |
|-----------|----------|-------------|--------------|
| **React 19** | `mfe-react19-eventbus-demo` | ~5.5KB | Interactive pub/sub demonstration |

### UI/UX Improvements

The Event Bus demo page features an optimized layout design:

1. **Top Navigation Bar** - Replaced sidebar with dropdown navigation to save ~250px horizontal space
2. **Compact Typography** - Using `text-xs` and `text-sm` for better content density
3. **3-Column Layout** - Main content (2 cols) + info panel (1 col) for optimal organization
4. **Tabbed MFE Interface** - Support for multiple MFE demos (React, Vue, Angular - coming soon)
5. **Container Event Emitter** - Dedicated section for container-to-MFE communication
6. **Active Subscriptions** - Pill badges with color-coded categories and unsubscribe functionality
7. **EventLog Component** - Reusable grayscale event stream display with consistent styling

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
# Build all service demos
pnpm --filter './apps/service-demos/**' build

# Copy to dist folder
pnpm copy-mfe-dists

# Serve MFEs
pnpm serve:mfes

# Start container
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
  }
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
  }
};

export default myServiceDemo;
```

### 4. Build and Register

```bash
# Build the demo
pnpm build

# Add to mfe-registry.json
# Copy dist files
pnpm copy-mfe-dists
```

## Best Practices

1. **Bundle Size**: Use ESBuild and mark framework dependencies as external
2. **Type Safety**: Always type as `MFEModule` from `@mfe-toolkit/core`
3. **Cleanup**: Properly cleanup in unmount (event listeners, subscriptions)
4. **Styling**: Use Tailwind utilities from container (bg-primary, text-primary-foreground)
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

- [ ] Logger Service Demo
- [ ] Auth Service Demo  
- [ ] Error Reporter Demo
- [ ] Notification Service Demo (standalone)
- [ ] Performance Monitoring Demo
- [ ] State Management Demo (cross-framework)

## Related Documentation

- [Modal Service API](./api/modal-service.md)
- [Event Bus API](./api/event-bus.md)
- [MFE Communication Guide](./mfe-communication-guide.md)
- [Architecture Decisions](./architecture/architecture-decisions.md)