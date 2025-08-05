# MFE Loading Guide

This guide explains the MFE loading system, current implementation details, known issues, and future improvements.

## Current State: Two Loaders

We currently have two MFE loader components with different use cases:

### 1. MFELoader (packages/mfe-dev-kit)

- **Purpose**: Standard MFE loader with error boundary protection
- **Use When**:
  - Page has stable state (minimal re-renders)
  - You need error boundary protection
  - You want retry mechanisms
- **Features**:
  - Built-in error boundaries
  - Automatic retry with exponential backoff
  - Error reporting integration
  - Loading states

### 2. IsolatedMFELoader (apps/container)

- **Purpose**: Prevents MFE unmounting during parent re-renders
- **Use When**:
  - Parent component has frequent state updates
  - You see MFEs flickering or unmounting/remounting
  - Event-heavy pages (like MFE Communication)
- **Features**:
  - DOM isolation
  - Minimal re-render impact
  - Stable mounting

## The Problem: Why Two Loaders?

### Issue Discovered

The MFE Communication page updates state on every event, causing:

1. Parent component re-renders
2. Props recreation (especially callbacks)
3. MFELoader's useEffect triggers
4. MFE unmounts and remounts
5. Visible flickering

### Temporary Solution

`IsolatedMFELoader` was created to:

- Remove problematic dependencies from useEffect
- Create isolated DOM containers
- Prevent unmounting on parent re-renders

## Better Solution: Consolidated Loader

### Proposed Unified Loader Design

```typescript
interface UnifiedMFELoaderProps {
  name: string;
  url: string;
  services: MFEServices;

  // Error handling
  errorBoundary?: boolean; // Default: true
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;

  // Performance
  isolate?: boolean; // Default: false - only true for problematic pages
  preload?: boolean; // Preload the module

  // UI
  fallback?: React.ReactNode;
  errorFallback?: (error: Error, retry: () => void) => React.ReactNode;
}

export const MFELoader: React.FC<UnifiedMFELoaderProps> = (props) => {
  const {
    errorBoundary = true,
    isolate = false,
    ...rest
  } = props;

  // Choose loading strategy based on isolation needs
  const LoaderComponent = isolate ? IsolatedStrategy : StandardStrategy;

  const content = <LoaderComponent {...rest} />;

  // Optionally wrap in error boundary
  return errorBoundary ? (
    <MFEErrorBoundary {...props}>
      {content}
    </MFEErrorBoundary>
  ) : content;
};
```

### Usage Examples

```typescript
// Standard usage (most cases)
<MFELoader
  name="serviceExplorer"
  url={mfeUrl}
  services={services}
/>

// For pages with frequent re-renders
<MFELoader
  name="serviceExplorer"
  url={mfeUrl}
  services={services}
  isolate={true}
/>

// Custom error handling
<MFELoader
  name="serviceExplorer"
  url={mfeUrl}
  services={services}
  errorBoundary={false}
  onError={customErrorHandler}
/>
```

## Migration Path

### Phase 1: Document Current State ✅

- Document when to use each loader
- Add console warnings for wrong usage

### Phase 2: Create Unified Loader

1. Implement unified loader with both strategies
2. Add migration guide
3. Update examples

### Phase 3: Gradual Migration

1. Update new code to use unified loader
2. Migrate existing code component by component
3. Add deprecation warnings to old loaders

### Phase 4: Cleanup

1. Remove old loaders
2. Simplify codebase
3. Update all documentation

## Best Practices

### 1. Prevent Re-render Issues

```typescript
// ❌ Bad: Inline callbacks cause re-renders
<MFELoader
  onError={(error) => console.log(error)}
/>

// ✅ Good: Memoized callbacks
const handleError = useCallback((error) => {
  console.log(error);
}, []);

<MFELoader onError={handleError} />
```

### 2. Optimize Event Handlers

```typescript
// ❌ Bad: Update state on every event
eventBus.on('*', (event) => {
  setEvents((prev) => [...prev, event]); // Causes re-render
});

// ✅ Good: Batch updates
const eventQueue = [];
const flushEvents = debounce(() => {
  setEvents((prev) => [...eventQueue, ...prev]);
  eventQueue.length = 0;
}, 100);

eventBus.on('*', (event) => {
  eventQueue.push(event);
  flushEvents();
});
```

### 3. Choose the Right Loader (Current State)

```typescript
// For stable pages
import { MFELoader } from '@mfe-toolkit/core';

// For event-heavy pages
import { IsolatedMFELoader } from '@/components/IsolatedMFELoader';
```

## Common Issues and Solutions

### Issue 1: MFE Flickers on Event Pages

**Symptom**: MFE unmounts/remounts when events fire
**Current Solution**: Use `IsolatedMFELoader`
**Future Solution**: Unified loader with `isolate={true}`

### Issue 2: Error Boundary Complexity

**Symptom**: Complex ref management in MFELoader
**Current Solution**: Deal with it 😅
**Future Solution**: Cleaner error boundary integration in unified loader

### Issue 3: Stale Closure in Callbacks

**Symptom**: Old callback versions being called
**Current Solution**: Use refs for callbacks
**Future Solution**: Better memoization strategies

## Testing Loaders

### Unit Tests

```typescript
// Test loading success
it('loads MFE successfully', async () => {
  const { container } = render(
    <MFELoader name="test" url="/test.js" services={mockServices} />
  );

  await waitFor(() => {
    expect(mockMount).toHaveBeenCalledWith(container, mockServices);
  });
});

// Test error handling
it('handles load errors', async () => {
  const onError = jest.fn();
  render(
    <MFELoader
      name="test"
      url="/404.js"
      services={mockServices}
      onError={onError}
    />
  );

  await waitFor(() => {
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
```

### Integration Tests

```typescript
// Test with real MFE
it('loads and interacts with MFE', async () => {
  render(<MFECommunicationPage />);

  // Should not flicker
  const mfe = await screen.findByTestId('service-explorer');
  expect(mfe).toBeInTheDocument();

  // Fire events
  fireEvent.click(screen.getByText('Emit Event'));

  // MFE should still be mounted
  expect(mfe).toBeInTheDocument();
});
```

## Performance Considerations

### Preloading

```typescript
// Preload MFEs likely to be used
const preloadMFE = (url: string) => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = url;
  document.head.appendChild(link);
};

// In navigation
onMouseEnter={() => preloadMFE(mfeUrl)}
```

### Caching

```typescript
const mfeCache = new Map();

const loadMFE = async (url: string) => {
  if (mfeCache.has(url)) {
    return mfeCache.get(url);
  }

  const module = await import(/* @vite-ignore */ url);
  mfeCache.set(url, module);
  return module;
};
```

## Future Improvements

1. **Unified Loader**: Single component with strategy pattern
2. **Better Isolation**: Consider Web Components or Shadow DOM
3. **Smarter Caching**: LRU cache with size limits
4. **Metrics**: Load time tracking and error rates
5. **Progressive Enhancement**: SSR support for SEO

## References

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Dynamic Import Performance](https://web.dev/dynamic-import/)
- [Preventing Re-renders](https://react.dev/learn/render-and-commit)
