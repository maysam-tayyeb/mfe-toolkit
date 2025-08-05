# @mfe-toolkit/state-middleware-performance

Performance monitoring middleware for `@mfe-toolkit/state` that tracks state update metrics, memory usage, and helps identify performance bottlenecks.

## Installation

```bash
npm install @mfe-toolkit/state-middleware-performance
# or
pnpm add @mfe-toolkit/state-middleware-performance
```

## Features

- 📊 Track state update performance metrics
- 🎯 Identify slow state updates
- 📈 Monitor memory usage
- 🔍 Detect large objects in state
- 📱 Cross-tab performance tracking
- 🎨 Framework-agnostic

## Usage

### Basic Setup

```typescript
import { createStateManager } from '@mfe-toolkit/state';
import { 
  createPerformanceMiddleware,
  initStatePerformanceMonitor 
} from '@mfe-toolkit/state-middleware-performance';

// Initialize performance monitoring
initStatePerformanceMonitor('my-app');

// Create state manager with performance middleware
const stateManager = createStateManager({
  middleware: [
    createPerformanceMiddleware()
  ]
});
```

### Advanced Configuration

```typescript
import { createPerformanceMiddlewareWithThresholds } from '@mfe-toolkit/state-middleware-performance';

const stateManager = createStateManager({
  middleware: [
    createPerformanceMiddlewareWithThresholds({
      slowUpdateThreshold: 16,     // Log updates slower than 16ms
      largeObjectThreshold: 1000,  // Log objects larger than 1KB
      logSlowUpdates: true,
      logLargeObjects: true
    })
  ]
});
```

### Manual Performance Tracking

```typescript
import { measureStateUpdate } from '@mfe-toolkit/state-middleware-performance';

// Measure specific operations
const result = measureStateUpdate(() => {
  stateManager.set('user', userData);
}, 'update-user-data');
```

### Getting Performance Reports

```typescript
import { getPerformanceSummary } from '@mfe-toolkit/state-middleware-performance';

// Get aggregated performance data
const summary = getPerformanceSummary();
console.log('Performance Summary:', summary);
```

## API Reference

### `initStatePerformanceMonitor(implementation: string)`

Initialize the performance monitor with an implementation name.

### `createPerformanceMiddleware()`

Creates a basic performance monitoring middleware.

### `createPerformanceMiddlewareWithThresholds(options)`

Creates performance middleware with customizable thresholds.

Options:
- `slowUpdateThreshold`: Milliseconds threshold for slow updates (default: 16)
- `largeObjectThreshold`: Bytes threshold for large objects (default: 1000)
- `logSlowUpdates`: Whether to log slow updates (default: true)
- `logLargeObjects`: Whether to log large objects (default: true)

### `measureStateUpdate<T>(operation: () => T, operationName?: string): T`

Manually measure the performance of a state update operation.

### `getPerformanceSummary(): Record<string, any>`

Get aggregated performance metrics from localStorage.

## Performance Metrics Tracked

- **State Updates**: Total count and average update time
- **Memory Usage**: JavaScript heap size (when available)
- **Render Count**: React render performance (when using React)
- **Session Duration**: Total time the application has been running
- **Errors**: State-related errors with timestamps

## License

MIT