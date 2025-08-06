# Vue 3 Modal Demo MFE

This microfrontend demonstrates the Modal Service integration with Vue 3.

## Features

- **Simple Alert**: Basic modal with OK button
- **Confirmation Dialog**: Modal with confirm/cancel actions
- **Form Modal**: Demonstrates content limitations
- **Custom Content**: Shows text-only content restriction
- **Error Example**: Modal with error variant and notification
- **Multiple Notifications**: Triggers various notification types
- **Nested Modals**: Explains limitation with nested modals
- **Size Variations**: Shows different modal sizes (sm, md, lg, xl)

## Limitations

Due to cross-framework boundaries (Vue 3 → React 19 container):

1. **Content**: Only plain text strings are supported
2. **Components**: Cannot pass Vue components as modal content
3. **Event Handlers**: Cannot attach Vue event handlers to modal content
4. **Nested Modals**: Cannot create interactive triggers for nested modals
5. **Styling**: Must rely on container's styles or inline styles

## Technical Details

- **Framework**: Vue 3.4+
- **Bundle Size**: ~50-60KB (with Vue bundled)
- **Build Tool**: Vite + ESBuild
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