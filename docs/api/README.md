# API Reference

This directory contains API documentation for all packages in the MFE Made Easy platform.

## 📦 Packages

### [@mfe-toolkit/core](../../packages/mfe-toolkit-core/README.md)

Core development kit for building MFEs

- TypeScript interfaces
- MFELoader component
- Service definitions
- Event bus implementation

### [@mfe/design-system](../../packages/design-system/README.md)

Shared UI components and design tokens

- ShadCN components
- Tailwind configuration
- Theme system

## 🔌 Core APIs

### MFE Module Interface

```typescript
interface MFEModule {
  mount(element: HTMLElement, services: MFEServices): void;
  unmount?(): void;
}
```

### MFE Services

```typescript
interface MFEServices {
  auth: AuthService;
  modal: ModalService;
  notification: NotificationService;
  eventBus: EventBus;
  logger: Logger;
  errorReporter?: ErrorReporter;
  stateManager?: StateManager; // Universal state manager
}
```

### Error Reporter API

The Error Reporter service provides centralized error tracking and reporting for MFEs.

```typescript
interface ErrorReporter {
  reportError(
    mfeName: string,
    error: Error,
    type?: 'load-error' | 'runtime-error' | 'network-error' | 'timeout-error',
    context?: ErrorContext,
    errorInfo?: ErrorInfo
  ): ErrorReport | null;

  getErrors(): ErrorReport[];
  getErrorsByMFE(mfeName: string): ErrorReport[];
  getErrorCounts(): Record<string, number>;
  getSummary(): ErrorSummary;
  clearErrors(): void;
}

interface ErrorReport {
  id: string;
  timestamp: Date;
  mfeName: string;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context?: {
    url?: string;
    userAgent?: string;
    sessionId?: string;
    userId?: string;
    retryCount?: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'load-error' | 'runtime-error' | 'network-error' | 'timeout-error';
}

interface ErrorSummary {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByMFE: Record<string, number>;
}
```

#### Usage Example

```typescript
// In your MFE
export default {
  mount(element: HTMLElement, services: MFEServices) {
    try {
      // Your MFE logic
    } catch (error) {
      services.errorReporter?.reportError('my-mfe', error as Error, 'runtime-error');
    }
  },
};
```

### State Manager API

The State Manager provides cross-MFE state synchronization with optional persistence and cross-tab sync.

```typescript
interface StateManager {
  // Core API
  get<T = StateValue>(key: StateKey): T | undefined;
  set<T = StateValue>(key: StateKey, value: T, source?: string): void;
  delete(key: string): void;
  clear(): void;

  // Subscription
  subscribe<T = StateValue>(key: StateKey, listener: StateListener<T>): Unsubscribe;
  subscribeAll(listener: GlobalStateListener): Unsubscribe;

  // MFE management
  registerMFE(mfeId: string, metadata?: MFERegistrationMetadata): void;
  unregisterMFE(mfeId: string): void;

  // State snapshots
  getSnapshot(): Record<StateKey, StateValue>;
  restoreSnapshot(snapshot: Record<StateKey, StateValue>): void;
}
```

#### Usage Example

```typescript
// In your MFE
export default {
  mount(element: HTMLElement, services: MFEServices) {
    // Get shared state
    const userPrefs = services.stateManager?.get('userPreferences');

    // Set shared state
    services.stateManager?.set('theme', 'dark', 'my-mfe');

    // Subscribe to changes
    const unsubscribe = services.stateManager?.subscribe('theme', (value) => {
      console.log('Theme changed to:', value);
    });

    return () => {
      unsubscribe?.();
    };
  },
};
```

### Event Bus API

```typescript
interface EventBus {
  emit(event: string, data: any): void;
  on(event: string, handler: Function): () => void;
  off(event: string, handler: Function): void;
}
```

## 📋 Coming Soon

- [ ] Detailed service API documentation
- [ ] TypeScript API reference
- [ ] REST API documentation (if applicable)
- [ ] GraphQL schema documentation (if applicable)
- [ ] WebSocket event documentation

---

_For implementation examples, see the [guides](../guides/) section._
