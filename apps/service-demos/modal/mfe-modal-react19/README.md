# mfe-modal-react19

## Description
React 19 general microfrontend with latest features and optimistic UI support.

## Features
- React 19 with latest APIs
- Server Components ready
- useOptimistic for optimistic UI updates
- use() hook for promise handling
- Enhanced Suspense and Actions
- General MFE functionality
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

## React 19 Specifics
This MFE leverages React 19's cutting-edge features:
- `useOptimistic()` for instant UI feedback
- `use()` hook for promise and context handling
- Server Components compatibility
- Enhanced form actions
- Improved hydration performance

## Integration
Designed to be loaded by the MFE container application with shared dependencies via import maps.
