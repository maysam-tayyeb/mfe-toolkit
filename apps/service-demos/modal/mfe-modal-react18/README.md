# mfe-modal-react18

## Description
React 18 modal microfrontend with concurrent features and modern APIs.

## Features
- React 18 with createRoot API
- Concurrent rendering capabilities
- Automatic batching
- useTransition and Suspense support
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
This MFE leverages React 18's modern features:
- `createRoot()` for concurrent rendering
- `useTransition()` for non-urgent updates
- Automatic batching of state updates
- Improved Suspense boundaries

## Integration
Designed to be loaded by the MFE container application with shared dependencies via import maps.
