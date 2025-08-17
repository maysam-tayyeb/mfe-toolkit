# mfe-modal-react18

## Description
React 18 modal microfrontend with concurrent features and automatic batching.

## Features
- React 18 with Concurrent Rendering
- Automatic batching for better performance
- Suspense for data fetching
- Transitions API ready
- Modal service integration
- Design system integration
- TypeScript support

## Development

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Build in watch mode
pnpm build:watch

# Clean build artifacts
pnpm clean
```

## React 18 Specifics
This MFE leverages React 18's concurrent features:
- Automatic batching for state updates
- Concurrent rendering capabilities
- Improved Suspense boundaries
- Transition API support

## Integration
Designed to be loaded by the MFE container application with shared dependencies via import maps.
