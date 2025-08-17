# @mfe-toolkit/state [WIP]

> **⚠️ Work in Progress**: This package is under active development and not yet ready for production use. APIs may change without notice.

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
  initialState: { count: 0 },
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
  initialState: { count: 0 },
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
