# React 17 Modal Demo MFE

This microfrontend demonstrates the modal service functionality using React 17, showcasing cross-version compatibility with a React 19 container.

## Overview

This MFE shows how legacy React 17 applications can integrate with modern container services while highlighting both capabilities and limitations.

## Features

- Simple alert modals
- Confirmation dialogs
- Error demonstrations
- Multiple notifications
- Size variations
- Plain text content support

## Limitations

Due to cross-version React incompatibility, React 17 MFEs have the following limitations when using the modal service:

1. **Plain Text Only**: Cannot pass React elements or HTML to modals
2. **No Interactive Content**: Cannot include buttons or forms in modal content
3. **No Nested Components**: Cannot embed React components
4. **No Event Handlers**: Cannot attach click handlers to modal content

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Technical Details

- **React Version**: 17.0.2
- **Rendering Method**: ReactDOM.render()
- **Build Tool**: Vite with ESBuild
- **JSX Runtime**: Classic (requires React imports)

## Alternative Approaches

For rich modal content with React 17:

1. Build modals within the MFE itself
2. Use the event bus for inter-MFE communication
3. Use the notification service for simple feedback
4. Consider upgrading to React 18+ for full compatibility