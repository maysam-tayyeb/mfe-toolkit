# Container App Hooks

This directory contains custom React hooks for the MFE container application.

## Available Hooks

### `useRegistry`

A hook that manages the MFE registry loading and state.

```typescript
import { useRegistry } from '@/hooks/useRegistry';

function MyComponent() {
  const { registry, isLoading, error, reload } = useRegistry();

  if (isLoading) {
    return <div>Loading registry...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Use registry
  const mfe = registry.get('example');
}
```

#### Options

- `loadOnMount?: boolean` - Whether to load the registry on mount (default: true)
- `onLoadSuccess?: () => void` - Callback when registry loads successfully
- `onLoadError?: (error: Error) => void` - Callback when registry fails to load
- Plus all options from `RegistryOptions` (url, fallbackUrl, cacheDuration, etc.)

#### Returns

- `registry: MFERegistryService` - The registry instance
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error if loading failed
- `reload: () => Promise<void>` - Function to reload the registry

### `useMFEUrls`

A hook that provides easy access to MFE URLs from the registry.

**Note:** This hook creates its own registry instance. To prevent multiple registry instances and potential infinite re-renders, use `useMFEUrlsFromContext` instead when inside components that are wrapped by `RegistryProvider`.

```typescript
import { useMFEUrls } from '@/hooks/useMFEUrls';

function MyComponent() {
  // Get specific MFE URLs
  const { urls, isLoading, error, getUrl } = useMFEUrls(['example', 'react17']);

  // Or get all MFE URLs
  const { urls: allUrls } = useMFEUrls();

  return (
    <MFELoader
      name="example"
      url={urls.example || getUrl('example')}
      // ...
    />
  );
}
```

### `useMFEUrlsFromContext`

A hook that provides easy access to MFE URLs using the registry from context. This prevents multiple registry instances and is the preferred approach when inside the `RegistryProvider`.

```typescript
import { useMFEUrlsFromContext } from '@/hooks/useMFEUrlsFromContext';

function MyComponent() {
  // Get specific MFE URLs from context
  const { urls, isLoading, error, getUrl } = useMFEUrlsFromContext(['example', 'react17']);

  // Or get all MFE URLs
  const { urls: allUrls } = useMFEUrlsFromContext();

  return (
    <MFELoader
      name="example"
      url={urls.example || getUrl('example')}
      // ...
    />
  );
}
```

#### Parameters

- `mfeNames?: string[]` - Optional array of MFE names to fetch URLs for. If not provided, returns all MFE URLs.

#### Returns

- `urls: MFEUrls` - Object mapping MFE names to their URLs
- `isLoading: boolean` - Registry loading state
- `error: Error | null` - Registry loading error
- `getUrl: (mfeName: string) => string | undefined` - Function to get a specific MFE URL

## Usage Examples

### Basic Registry Usage

```typescript
function App() {
  const { registry, isLoading } = useRegistry();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <MFEPage registry={registry} />
  );
}
```

### Custom Registry Configuration

```typescript
function App() {
  const { registry, isLoading, reload } = useRegistry({
    url: 'https://api.example.com/mfe-registry',
    cacheDuration: 60 * 60 * 1000, // 1 hour
    onLoadSuccess: () => console.log('Registry loaded!'),
    onLoadError: (error) => console.error('Registry failed:', error),
  });

  return (
    <div>
      <button onClick={reload}>Refresh Registry</button>
      {/* ... */}
    </div>
  );
}
```

### Using MFE URLs in Components

```typescript
function MFEGrid() {
  const { urls, isLoading } = useMFEUrls();

  if (isLoading) {
    return <div>Loading MFEs...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(urls).map(([name, url]) => (
        <MFELoader
          key={name}
          name={name}
          url={url}
          services={services}
        />
      ))}
    </div>
  );
}
```

### Error Handling

```typescript
function MFEContainer() {
  const { registry, isLoading, error, reload } = useRegistry();

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        retry={reload}
        fallback="Failed to load MFE registry"
      />
    );
  }

  // ...
}
```

## Environment Variables

The hooks automatically use these environment variables:

- `VITE_MFE_REGISTRY_URL` - Primary registry URL
- `MODE` - Environment mode (development/production)

The registry will try to load from:

1. `VITE_MFE_REGISTRY_URL` if set
2. `/mfe-registry-v2.json` as default (V2 format with enhanced metadata)
3. `/mfe-registry.{environment}.json` as fallback

## Best Practices

1. **Use at the top level** - These hooks should typically be used in top-level components or contexts
2. **Handle loading states** - Always show appropriate loading UI
3. **Handle errors gracefully** - Provide fallbacks or retry mechanisms
4. **Cache wisely** - The registry is cached in localStorage with configurable expiration
5. **Share via context** - For multiple components needing registry access, consider using `RegistryContext`
