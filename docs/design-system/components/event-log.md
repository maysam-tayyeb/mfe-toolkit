# EventLog Component

## Overview

The EventLog component displays a chronological list of events, commonly used for showing system activity, user actions, or message streams.

## CSS Structure

```html
<div class="ds-event-log">
  <div class="ds-event-log-header">
    <h4 class="text-sm font-medium">Event Log</h4>
    <button class="ds-button-ghost ds-button-xs">Clear</button>
  </div>
  <div class="ds-event-log-body">
    <!-- Event items -->
  </div>
</div>
```

## React Component

```tsx
import { EventLog } from '@mfe/design-system-react';

const messages = [
  { id: '1', event: 'user:login', data: {...}, timestamp: '10:30:45' },
  { id: '2', event: 'data:update', data: {...}, timestamp: '10:31:12' }
];

<EventLog
  messages={messages}
  onClear={() => setMessages([])}
  emptyMessage="No events yet"
  maxHeight="400px"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| messages | EventMessage[] | [] | Array of event messages |
| onClear | function | - | Clear button handler |
| emptyMessage | string | 'No events' | Empty state message |
| maxHeight | string | '300px' | Maximum height before scroll |

## Event Message Format

```typescript
interface EventMessage {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  source?: string;
  level?: 'info' | 'warning' | 'error';
}
```

## Styling Events

```html
<div class="ds-event-item">
  <span class="ds-event-time">10:30:45</span>
  <span class="ds-event-name">user:login</span>
  <span class="ds-event-source">Container</span>
</div>
```

## Best Practices

1. **Limit visible items** - Show last 50-100 events
2. **Include timestamps** - Always show when events occurred
3. **Color coding** - Use colors for event types/severity
4. **Clear action** - Allow users to clear the log
5. **Auto-scroll** - New events at top or bottom consistently