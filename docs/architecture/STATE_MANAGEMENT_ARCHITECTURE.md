# State Management Architecture

This document explains the state management architecture in the MFE Made Easy platform, specifically the distinction and interaction between the ContextBridge and Valtio State Manager.

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

## Migration Consideration: Theme Management

Currently, theme management is split:

- Theme state is in Universal State Manager
- Theme application happens in container

### Recommendation

Move theme to ContextBridge as a container service:

```typescript
// Future: Theme as a container service
services.theme = {
  setTheme: (theme: 'light' | 'dark') => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  },
  getTheme: () => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  },
  subscribe: (callback: (theme: string) => void) => {
    // Subscribe to theme changes
  },
};
```

This would:

- Clarify that theme is a container UI concern
- Simplify the architecture
- Keep all UI services in one place

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
    const stateManager = getGlobalStateManager();

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

## Summary

The dual state management approach provides:

- **Clear architectural boundaries**
- **Appropriate tool for each use case**
- **Framework flexibility**
- **Scalable MFE development**

By maintaining this separation, the platform remains maintainable and each system can evolve independently while serving its specific purpose effectively.
