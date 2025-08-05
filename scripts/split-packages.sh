#!/bin/bash

echo "🔧 Splitting mfe-dev-kit into core, react, and cli packages..."

# Create directory structures
echo "📁 Creating directory structures..."
mkdir -p packages/mfe-toolkit-cli/src/{commands,templates,utils}
mkdir -p packages/mfe-toolkit-react/src/{components,hooks,services,state}

# Move CLI files
echo "📦 Moving CLI files to @mfe-toolkit/cli..."
cp -r packages/mfe-dev-kit/src/cli/* packages/mfe-toolkit-cli/src/commands/ 2>/dev/null || true

# Move React components
echo "⚛️ Moving React components to @mfe-toolkit/react..."
cp -r packages/mfe-dev-kit/src/components/* packages/mfe-toolkit-react/src/components/ 2>/dev/null || true
cp packages/mfe-dev-kit/src/services/dependency-injection.tsx packages/mfe-toolkit-react/src/services/ 2>/dev/null || true
cp -r packages/mfe-dev-kit/src/state/* packages/mfe-toolkit-react/src/state/ 2>/dev/null || true

# Create new types file for React that extends core types
echo "📝 Creating React-specific types..."
cat > packages/mfe-toolkit-react/src/types.ts << 'EOF'
import type { BaseModalConfig } from '@mfe-toolkit/core';
import type { ReactNode } from 'react';

export interface ModalConfig extends BaseModalConfig<ReactNode> {}
EOF

# Update core types to be framework-agnostic
echo "🔧 Making core types framework-agnostic..."
cat > packages/mfe-dev-kit/src/types/modal.ts << 'EOF'
export interface BaseModalConfig<TContent = any> {
  title: string;
  content: TContent;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClose?: () => void;
  onConfirm?: () => void;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}
EOF

# Create tsconfig files
echo "⚙️ Creating TypeScript configurations..."

# CLI tsconfig
cat > packages/mfe-toolkit-cli/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
EOF

# React tsconfig
cat > packages/mfe-toolkit-react/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
EOF

# Create CLI entry point
echo "🚀 Creating CLI entry point..."
cat > packages/mfe-toolkit-cli/src/index.ts << 'EOF'
#!/usr/bin/env node

import { program } from 'commander';
import { createCommand } from './commands/create';
import { generateCommand } from './commands/generate';
import { validateCommand } from './commands/validate';

program
  .name('mfe-toolkit')
  .description('CLI for creating and managing microfrontends')
  .version('0.1.0');

program.addCommand(createCommand);
program.addCommand(generateCommand);
program.addCommand(validateCommand);

program.parse();
EOF

# Create React entry point
echo "🚀 Creating React entry point..."
cat > packages/mfe-toolkit-react/src/index.ts << 'EOF'
// Components
export { MFELoader } from './components/MFELoader';
export { MFEPage } from './components/MFEPage';
export { MFEErrorBoundary, withMFEErrorBoundary } from './components/MFEErrorBoundary';

// Services
export { MFEProvider, useMFEServices } from './services/dependency-injection';

// State Management
export * from './state/mfe-store-factory';
export * from './state/mfe-store-hooks';

// Types
export type { ModalConfig } from './types';
EOF

# Create READMEs
echo "📚 Creating README files..."

cat > packages/mfe-toolkit-cli/README.md << 'EOF'
# @mfe-toolkit/cli

Command-line interface for creating and managing microfrontends.

## Installation

```bash
npm install -g @mfe-toolkit/cli
```

## Usage

```bash
# Create a new MFE
mfe create my-mfe

# Generate manifest
mfe generate manifest

# Validate manifests
mfe validate
```

## Supported Frameworks

- React (17, 18, 19)
- Vue 3
- Vanilla JavaScript/TypeScript
- Angular (coming soon)

## License

MIT
EOF

cat > packages/mfe-toolkit-react/README.md << 'EOF'
# @mfe-toolkit/react

React components and hooks for building microfrontends.

## Installation

```bash
npm install @mfe-toolkit/react @mfe-toolkit/core
```

## Features

- 🧩 MFE loader components with error boundaries
- 🎣 React hooks for MFE services
- 💉 Dependency injection via React Context
- 🏪 State management with Zustand
- 🔐 TypeScript support

## Usage

```tsx
import { MFELoader, MFEProvider } from '@mfe-toolkit/react';

function App() {
  return (
    <MFEProvider services={services}>
      <MFELoader
        url="http://localhost:8080/my-mfe.js"
        fallback={<div>Loading...</div>}
      />
    </MFEProvider>
  );
}
```

## License

MIT
EOF

# Copy LICENSE files
echo "📄 Copying LICENSE files..."
cp packages/mfe-dev-kit/LICENSE packages/mfe-toolkit-cli/LICENSE
cp packages/mfe-dev-kit/LICENSE packages/mfe-toolkit-react/LICENSE

echo "✅ Package split preparation complete!"
echo ""
echo "Next steps:"
echo "1. Review and move remaining files manually"
echo "2. Update imports in moved files"
echo "3. Update mfe-dev-kit to only contain framework-agnostic code"
echo "4. Test the split packages"