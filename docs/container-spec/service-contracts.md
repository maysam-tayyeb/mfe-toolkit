# Container Service Contracts

This document defines the API contracts that every container implementation must provide to MFEs.

## Service Interface

All services are provided to MFEs through a single `services` object with the following structure:

```typescript
interface MFEServices {
  logger: LoggerService;
  eventBus: EventBusService;
  auth: AuthService;
  modal: ModalService;
  notification: NotificationService;
  errorReporter: ErrorReporterService;
  stateManager?: StateManager; // Optional
}
```

## Logger Service

Provides structured logging with different severity levels.

```typescript
interface LoggerService {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
```

### Usage Example

```javascript
services.logger.info('MFE initialized', { mfeId: 'example', version: '1.0.0' });
services.logger.error('Failed to load data', error);
```

## Event Bus Service

Enables publish-subscribe communication between MFEs.

```typescript
interface EventBusService {
  emit<T = any>(event: string, data?: T): void;
  on<T = any>(event: string, handler: (data: T) => void): () => void;
  off(event: string, handler?: Function): void;
  once<T = any>(event: string, handler: (data: T) => void): void;
}
```

### Standard Events

Containers should emit these lifecycle events:

- `mfe:loaded` - When an MFE is successfully loaded
- `mfe:unloaded` - When an MFE is unmounted
- `mfe:error` - When an MFE fails to load
- `navigation:change` - When route changes
- `auth:login` - When user logs in
- `auth:logout` - When user logs out

### Usage Example

```javascript
// Subscribe to events
const unsubscribe = services.eventBus.on('user:updated', (user) => {
  console.log('User updated:', user);
});

// Emit events
services.eventBus.emit('cart:add', { productId: '123', quantity: 1 });

// Cleanup
unsubscribe();
```

## Authentication Service

Manages user authentication state and permissions.

```typescript
interface AuthService {
  getSession(): Session | null;
  isAuthenticated(): boolean;
  hasPermission(permission: string): boolean;
  hasRole(role: string): boolean;
}

interface Session {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
}
```

### Usage Example

```javascript
if (services.auth.isAuthenticated()) {
  const session = services.auth.getSession();
  console.log(`Welcome ${session.username}`);
}

if (services.auth.hasPermission('admin.write')) {
  // Show admin features
}
```

## Modal Service

Provides programmatic modal management.

```typescript
interface ModalService {
  open(config: ModalConfig): void;
  close(): void;
}

interface ModalConfig {
  title: string;
  content: React.ReactNode | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  onClose?: () => void;
}
```

### Usage Example

```javascript
services.modal.open({
  title: 'Confirm Action',
  content: 'Are you sure you want to proceed?',
  size: 'sm',
  closable: true,
  onClose: () => console.log('Modal closed'),
});
```

## Notification Service

Shows toast notifications to users.

```typescript
interface NotificationService {
  show(config: NotificationConfig): void;
  success(title: string, message?: string): void;
  error(title: string, message?: string): void;
  warning(title: string, message?: string): void;
  info(title: string, message?: string): void;
}

interface NotificationConfig {
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds
}
```

### Usage Example

```javascript
// Simple notifications
services.notification.success('Saved', 'Your changes have been saved');
services.notification.error('Error', 'Failed to save changes');

// Advanced notification
services.notification.show({
  title: 'Processing',
  message: 'This may take a few moments',
  type: 'info',
  duration: 5000,
});
```

## Error Reporter Service

Centralized error tracking and reporting.

```typescript
interface ErrorReporterService {
  reportError(error: Error, context?: ErrorContext): void;
  reportWarning(message: string, context?: ErrorContext): void;
}

interface ErrorContext {
  mfeId?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
}
```

### Usage Example

```javascript
try {
  await riskyOperation();
} catch (error) {
  services.errorReporter.reportError(error, {
    mfeId: 'example-mfe',
    action: 'riskyOperation',
    metadata: { attemptCount: 3 },
  });
}
```

## State Manager (Optional)

If provided, enables cross-MFE state synchronization.

```typescript
interface StateManager {
  get<T = any>(key: string): T | undefined;
  set<T = any>(key: string, value: T): void;
  subscribe<T = any>(key: string, callback: (value: T) => void): () => void;
  clear(): void;
}
```

### Usage Example

```javascript
// Set state
services.stateManager?.set('theme', 'dark');

// Get state
const theme = services.stateManager?.get('theme');

// Subscribe to changes
const unsubscribe = services.stateManager?.subscribe('theme', (newTheme) => {
  console.log('Theme changed to:', newTheme);
});
```

## Service Implementation Guidelines

1. **Consistency**: All containers must implement the exact same API
2. **Error Handling**: Services should not throw errors; log them instead
3. **Performance**: Services should be lightweight and not block MFE loading
4. **Isolation**: Service state should not leak between MFEs
5. **Testing**: Provide mock implementations for testing

## Mock Services Example

For development and testing:

```javascript
const mockServices = {
  logger: {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  },
  eventBus: {
    emit: () => {},
    on: () => () => {},
    off: () => {},
    once: () => {},
  },
  auth: {
    getSession: () => null,
    isAuthenticated: () => false,
    hasPermission: () => false,
    hasRole: () => false,
  },
  modal: {
    open: (config) => alert(config.title),
    close: () => {},
  },
  notification: {
    show: (config) => console.log('Notification:', config),
    success: (title, message) => console.log('Success:', title, message),
    error: (title, message) => console.log('Error:', title, message),
    warning: (title, message) => console.log('Warning:', title, message),
    info: (title, message) => console.log('Info:', title, message),
  },
  errorReporter: {
    reportError: (error, context) => console.error('Error:', error, context),
    reportWarning: (message, context) => console.warn('Warning:', message, context),
  },
};
```
