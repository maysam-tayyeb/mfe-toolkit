# mfe-modal-solidjs

## Description
Solid.js general microfrontend with fine-grained reactivity and exceptional performance.

## Features
- Solid.js with signals and reactive primitives
- No Virtual DOM - direct DOM updates
- Fine-grained reactivity system
- Compiled reactive primitives
- Small bundle size (~7kb)
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

## Solid.js Specifics
This MFE leverages Solid.js's unique features:
- `createSignal()` for reactive state
- `createMemo()` for computed values
- `createEffect()` for side effects
- JSX compiled to efficient DOM operations
- No re-renders, only precise updates

## Integration
Designed to be loaded by the MFE container application with shared dependencies via import maps.
