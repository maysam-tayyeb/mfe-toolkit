#!/bin/bash

# Script to fix missing package requirements

echo "🔧 Fixing package configurations..."

# Add LICENSE files
for pkg in shared universal-state design-system; do
  if [ ! -f "packages/$pkg/LICENSE" ]; then
    echo "Adding LICENSE to packages/$pkg..."
    cp packages/mfe-dev-kit/LICENSE packages/$pkg/LICENSE
  fi
done

# Add publishConfig and repository info to package.json files
for pkg in shared universal-state design-system; do
  echo "Updating packages/$pkg/package.json..."
  
  # Read current package.json
  pkg_json="packages/$pkg/package.json"
  
  # Add publishConfig and repository info using Node.js
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$pkg_json', 'utf8'));
    
    // Add files field if missing
    if (!pkg.files) {
      pkg.files = ['dist', 'README.md', 'LICENSE', 'package.json'];
    }
    
    // Add publishConfig
    if (!pkg.publishConfig) {
      pkg.publishConfig = {
        access: 'public',
        registry: 'https://registry.npmjs.org/'
      };
    }
    
    // Add repository info
    if (!pkg.repository) {
      pkg.repository = {
        type: 'git',
        url: 'https://github.com/maysam-tayyeb/mfe-toolkit.git',
        directory: 'packages/$pkg'
      };
    }
    
    // Add bugs URL
    if (!pkg.bugs) {
      pkg.bugs = {
        url: 'https://github.com/maysam-tayyeb/mfe-toolkit/issues'
      };
    }
    
    // Add homepage
    if (!pkg.homepage) {
      pkg.homepage = 'https://github.com/maysam-tayyeb/mfe-toolkit/tree/main/packages/$pkg#readme';
    }
    
    // Add keywords if missing
    if (!pkg.keywords || pkg.keywords.length === 0) {
      pkg.keywords = ['mfe', 'microfrontend', 'toolkit'];
    }
    
    // Add author
    if (!pkg.author) {
      pkg.author = 'Maysam Tayyeb <maysam@example.com>';
    }
    
    // Add license
    if (!pkg.license) {
      pkg.license = 'MIT';
    }
    
    fs.writeFileSync('$pkg_json', JSON.stringify(pkg, null, 2) + '\n');
  "
done

# Create README files
if [ ! -f "packages/shared/README.md" ]; then
  echo "Creating README for @mfe-toolkit/shared..."
  cat > packages/shared/README.md << 'EOF'
# @mfe-toolkit/shared

Shared utilities and constants for MFE Toolkit.

## Installation

```bash
npm install @mfe-toolkit/shared
```

## Usage

```typescript
import { EVENTS, utils } from '@mfe-toolkit/shared';

// Use shared constants
console.log(EVENTS.USER_LOGIN);

// Use shared utilities
const result = utils.formatDate(new Date());
```

## License

MIT
EOF
fi

if [ ! -f "packages/universal-state/README.md" ]; then
  echo "Creating README for @mfe-toolkit/state..."
  cat > packages/universal-state/README.md << 'EOF'
# @mfe-toolkit/state

Framework-agnostic state management for microfrontends with cross-tab synchronization.

## Installation

```bash
npm install @mfe-toolkit/state
```

## Features

- 🔄 Cross-tab state synchronization
- 📦 Framework-agnostic (React, Vue, Vanilla JS)
- 💾 Automatic persistence
- 🎯 TypeScript support
- 🚀 Minimal bundle size

## Usage

### React

```typescript
import { createStateManager } from '@mfe-toolkit/state';
import { useSnapshot } from '@mfe-toolkit/state/react';

const stateManager = createStateManager({
  key: 'app-state',
  initialState: { count: 0 }
});

function Counter() {
  const state = useSnapshot(stateManager);
  
  return (
    <button onClick={() => stateManager.state.count++}>
      Count: {state.count}
    </button>
  );
}
```

### Vue

```vue
<template>
  <button @click="increment">Count: {{ state.count }}</button>
</template>

<script setup>
import { createStateManager } from '@mfe-toolkit/state';
import { useSnapshot } from '@mfe-toolkit/state/vue';

const stateManager = createStateManager({
  key: 'app-state',
  initialState: { count: 0 }
});

const state = useSnapshot(stateManager);
const increment = () => stateManager.state.count++;
</script>
```

### Vanilla JavaScript

```javascript
import { createStateManager } from '@mfe-toolkit/state';

const stateManager = createStateManager({
  key: 'app-state',
  initialState: { count: 0 }
});

// Subscribe to changes
stateManager.subscribe((state) => {
  console.log('State updated:', state);
});

// Update state
stateManager.state.count++;
```

## License

MIT
EOF
fi

echo "✅ Package fixes complete!"