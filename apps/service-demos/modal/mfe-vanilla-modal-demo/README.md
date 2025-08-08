# Vanilla TypeScript Modal Demo MFE

This microfrontend demonstrates the Modal Service integration with pure TypeScript (no framework).

## Features

- **Simple Alert**: Basic modal with OK button
- **Confirmation Dialog**: Modal with confirm/cancel actions
- **Form Modal**: Demonstrates content limitations
- **Custom Content**: Shows text-only content restriction
- **Error Example**: Modal with error variant and notification
- **Multiple Notifications**: Triggers various notification types
- **Nested Modals**: Explains limitation with nested modals
- **Size Variations**: Shows different modal sizes (sm, md, lg, xl)

## Advantages

- **Smallest Bundle**: ~5-10KB (no framework overhead)
- **Best Performance**: Direct DOM manipulation
- **Type Safety**: Full TypeScript support
- **Zero Dependencies**: Only depends on MFE toolkit core

## Limitations

Due to cross-framework boundaries (Vanilla TS → React 19 container):

1. **Content**: Only plain text strings are supported
2. **DOM Elements**: Cannot pass DOM elements as modal content
3. **Event Handlers**: Cannot attach event handlers to modal content
4. **Nested Modals**: Cannot create interactive triggers for nested modals
5. **Styling**: Must rely on container's styles

## Technical Details

- **Framework**: None (Pure TypeScript)
- **Bundle Size**: ~5-10KB
- **Build Tool**: ESBuild
- **Type Safety**: Full TypeScript support

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check
```

## Integration

This MFE is automatically registered in the container's MFE registry and loaded dynamically when needed.
