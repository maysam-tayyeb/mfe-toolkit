# State Management Architecture

This document explains the state management architecture in the MFE Made Easy platform, specifically the distinction and interaction between the ContextBridge and Universal State Manager.

## Overview

The platform uses two complementary state management systems:

1. **ContextBridge** - Container-provided UI services
2. **Universal State Manager** - Cross-MFE application state with vendor-agnostic abstraction (currently powered by Valtio proxy-based reactivity)

Both systems co-exist and serve different purposes in the architecture.

> **Note**: The Universal State Manager provides an abstraction layer that allows switching the underlying state management implementation without breaking MFE contracts. See [Universal State Abstraction](./UNIVERSAL_STATE_ABSTRACTION.md) for details.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Container Application                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   ContextBridge                      │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ │   │
│  │  │AuthService  │ │ModalService │ │NotifyService │ │   │
│  │  │(Container)  │ │(Container UI)│ │(Container UI)│ │   │
│  │  └─────────────┘ └──────────────┘ └──────────────┘ │   │
│  │                                                      │   │
│  │  Purpose: Container-provided infrastructure services │   │
│  │  Lifecycle: Lives as long as container              │   │
│  │  Access: MFEs call → Container responds             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│          Universal State Manager (Abstraction Layer)        │
│                                                             │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │ Cart State  │ │User Prefs    │ │ Product Selection │   │
│  │(Business)   │ │(Application) │ │ (Shared Data)     │   │
│  └─────────────┘ └──────────────┘ └───────────────────┘   │
│                                                             │
│  Purpose: Shared application/business state                │
│  Lifecycle: Can persist across sessions                    │
│  Access: Any MFE can read/write                           │
│  Features: Cross-tab sync, persistence, framework-agnostic │
│  Implementation: Currently Valtio (proxy-based reactivity) │
│  Abstraction: Vendor-independent interface                 │
│  Middleware: Extensible with performance monitoring, etc.  │
└─────────────────────────────────────────────────────────────┘
```

## ContextBridge: Container Services

### Purpose

The ContextBridge provides MFEs with access to container-specific UI services that cannot be implemented within individual MFEs.

### Services Provided

```typescript
interface ContainerServices {
  // Authentication Service
  auth: {
    getSession(): AuthSession | null;
    isAuthenticated(): boolean;
    hasPermission(permission: string): boolean;
    hasRole(role: string): boolean;
  };

  // Modal Service - Renders in container's modal root
  modal: {
    open(config: ModalConfig): void;
    close(): void;
  };

  // Notification Service - Renders in container's notification area
  notification: {
    show(config: NotificationConfig): void;
    success(title: string, message?: string): void;
    error(title: string, message?: string): void;
    warning(title: string, message?: string): void;
    info(title: string, message?: string): void;
  };

  // Future: Theme Service (currently in Universal State)
  // theme: {
  //   setTheme(theme: 'light' | 'dark'): void;
  //   getTheme(): 'light' | 'dark';
  // };
}
```

### Characteristics

- **Container-owned**: These services require container infrastructure
- **Imperative API**: MFEs call methods, container handles implementation
- **UI-focused**: Primarily for UI elements that render in container
- **Stateless for MFEs**: MFEs don't manage this state directly

### Implementation

```typescript
// How MFEs use container services
export default {
  mount: (element, services) => {
    // Show a modal (rendered by container)
    services.modal.open({
      title: 'Confirm Action',
      content: 'Are you sure?',
    });

    // Check authentication
    if (!services.auth.isAuthenticated()) {
      services.notification.error('Please log in');
    }
  },
};
```

## Universal State Manager: Shared Application State

### Purpose

The Universal State Manager provides a framework-agnostic way for MFEs to share application and business state.

### State Categories

```typescript
// Business State - Core application data
stateManager.set('cart', {
  items: [...],
  total: 99.99
});

// User Preferences - Persisted across sessions
stateManager.set('userPreferences', {
  language: 'en',
  currency: 'USD',
  notifications: true
});

// MFE Communication - Temporary shared state
stateManager.set('selectedProduct', productId);
stateManager.set('filterCriteria', filters);

// Cross-MFE Events
stateManager.set('lastAction', {
  type: 'PRODUCT_ADDED',
  timestamp: Date.now(),
  mfeId: 'product-catalog'
});
```

### Characteristics

- **MFE-owned**: Any MFE can read/write state
- **Persistent**: Can survive page reloads via localStorage
- **Cross-tab sync**: Changes sync across browser tabs
- **Framework-agnostic**: Works with React, Vue, Vanilla JS
- **Reactive**: MFEs can subscribe to state changes
- **Middleware support**: Extensible with performance monitoring, logging, validation

### Implementation

```typescript
// React MFE
const [cart, setCart] = adapter.useGlobalState('cart');

// Vue MFE
const cart = adapter.globalState('cart');

// Vanilla JS MFE
const cart = stateManager.get('cart');
stateManager.subscribe('cart', (newCart) => {
  updateUI(newCart);
});
```

## When to Use Which?

### Use ContextBridge Services When:

- ✅ Rendering UI in the container (modals, notifications)
- ✅ Accessing container-managed auth state
- ✅ Calling container-provided functionality
- ✅ Need imperative API for UI actions

### Use Universal State Manager When:

- ✅ Sharing business data between MFEs
- ✅ Storing user preferences
- ✅ Implementing cross-MFE workflows
- ✅ Need reactive state updates
- ✅ Require state persistence
- ✅ Building framework-agnostic MFEs

## ✅ Theme Management Migration (Completed)

Theme management has been successfully migrated from Universal State Manager to a dedicated container service.

### Implementation

Theme is now a container service in the ContextBridge:

```typescript
// Implemented in theme-service.ts
export interface ThemeService {
  getTheme: () => Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  subscribe: (callback: (theme: Theme) => void) => () => void;
}

// Available to all MFEs via services.theme
services.theme?.setTheme('dark');
services.theme?.toggleTheme();
const unsubscribe = services.theme?.subscribe((theme) => {
  console.log('Theme changed to:', theme);
});
```

### Benefits Achieved

- ✅ Theme is now clearly a container UI concern
- ✅ Simplified architecture with all UI services in ContextBridge
- ✅ Removed theme from universal state, reducing state complexity
- ✅ Automatic persistence to localStorage
- ✅ Respects system theme preference when no user preference is set
- ✅ All MFEs can access theme service for theme-aware rendering

## Best Practices

### 1. Clear Separation

- **Container Services**: UI infrastructure, auth, container features
- **Universal State**: Business data, user data, MFE communication

### 2. Don't Duplicate State

- Auth state belongs in ContextBridge only
- Business data belongs in Universal State only
- Avoid syncing between the two systems

### 3. Performance Considerations

- ContextBridge services are synchronous calls
- Universal State updates are asynchronous
- Use subscriptions wisely to avoid excessive re-renders

### 4. Testing Strategy

- Mock ContextBridge services for MFE unit tests
- Use real Universal State Manager for integration tests
- Test cross-MFE workflows with both systems

## Example: Complete MFE Setup

```typescript
// MFE using both systems appropriately
export default {
  mount: (element, services) => {
    const { auth, modal, notification } = services;
    const stateManager = getGlobalStateManager({
      middleware: [
        // Optional: Add performance monitoring
        createPerformanceMiddleware()
      ]
    });

    // Check auth via ContextBridge
    if (!auth.isAuthenticated()) {
      notification.error('Please log in');
      return;
    }

    // Get/set business state via Universal State
    const cart = stateManager.get('cart') || { items: [] };

    // Subscribe to state changes
    const unsubscribe = stateManager.subscribe('selectedProduct', (productId) => {
      // React to product selection from another MFE
      loadProductDetails(productId);
    });

    // Use container UI services
    const handleCheckout = () => {
      modal.open({
        title: 'Checkout',
        content: CheckoutForm,
        props: { cart },
      });
    };

    // Cleanup
    return () => {
      unsubscribe();
    };
  },
};
```

## Middleware Support

The Universal State Manager supports middleware for extending functionality:

```typescript
import { createStateManager } from '@mfe-toolkit/state';
import { createPerformanceMiddleware } from '@mfe-toolkit/state-middleware-performance';

// Create state manager with middleware
const stateManager = createStateManager({
  middleware: [
    createPerformanceMiddleware({
      slowUpdateThreshold: 16,  // Log updates slower than 16ms
      largeObjectThreshold: 1000  // Log objects larger than 1KB
    }),
    // Add more middleware as needed
    loggingMiddleware,
    validationMiddleware
  ]
});
```

Available middleware packages:
- `@mfe-toolkit/state-middleware-performance` - Performance monitoring
- More middleware packages coming soon...

## Summary

The dual state management approach provides:

- **Clear architectural boundaries**
- **Appropriate tool for each use case**
- **Framework flexibility**
- **Extensible architecture with middleware**
- **Scalable MFE development**

By maintaining this separation, the platform remains maintainable and each system can evolve independently while serving its specific purpose effectively.
