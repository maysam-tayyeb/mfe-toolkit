# Service Explorer MFEs Documentation

This document archives the functionality of the Service Explorer MFEs that were removed to optimize the codebase for the design system implementation and MFE reorganization.

## Removed MFEs Overview

### 1. mfe-example (Service Explorer React 19)

- **Location**: `apps/mfe-example/`
- **Size**: ~585 lines
- **Port**: 3001
- **Framework**: React 19.1.0
- **Bundle Size**: ~14KB

#### Key Features:

- **Event Bus Demo**:
  - Dynamic event listening with subscribe/unsubscribe
  - Custom event emission with JSON payloads
  - Event log showing sent/received events
  - Real-time event monitoring

- **Modal Service Integration**:
  - Simple alert modals
  - Confirmation dialogs with callbacks
  - Form modals with input validation
  - Multiple modal sizes (sm, md, lg)

- **Notification Service**:
  - Success, error, warning, info toast notifications
  - Programmatic notification triggers
  - Auto-dismiss functionality

- **Auth Service**:
  - Session information display
  - Permission checking
  - Role-based access demonstration

- **Logger Service**:
  - Debug, info, warn, error logging levels
  - Console output demonstration

- **State Management**:
  - Zustand store integration
  - Counter, user management, items list demos
  - Isolated MFE state

- **Typed Event Bus**:
  - Type-safe event emission
  - Compile-time type checking
  - Statistics tracking

### 2. mfe-react17 (Legacy Service Explorer)

- **Location**: `apps/mfe-react17/`
- **Size**: ~500 lines
- **Port**: 3002
- **Framework**: React 17.0.2 (bundled)
- **Bundle Size**: ~159KB

#### Key Features:

- **Cross-version Compatibility**:
  - React 17 running inside React 19 container
  - ReactDOM.render instead of createRoot
  - Full service compatibility demonstration

- **Service Integration**:
  - Same services as React 19 version
  - Proves backward compatibility
  - Event bus, modals, notifications, auth, logger

- **Compatibility Status Display**:
  - Visual indicators for service connections
  - Cross-version communication proof

- **Note**: Zustand state management disabled due to React hooks conflict

### 3. mfe-event-demo

- **Location**: `apps/mfe-event-demo/`
- **Size**: ~159 lines
- **Port**: Not specified
- **Framework**: React 19

#### Key Features:

- Simple event emitter with instance support
- Event name and JSON payload input
- Event log display (keeps last 10 events)
- Cross-instance communication
- Container broadcast listening
- Sent/Received event differentiation with visual indicators

### 4. mfe-state-demo-react

- **Location**: `apps/mfe-state-demo-react/`
- **Size**: ~153 lines
- **Framework**: React 19
- **Purpose**: Universal state management demo

#### Key Features:

- Cross-framework state synchronization using @mfe-toolkit/state
- User management with form inputs (name, email)
- Shared counter with increment functionality
- State snapshot display showing all state
- Real-time state updates with subscriptions
- MFE registration/unregistration
- State change logging

### 5. mfe-state-demo-vue

- **Location**: `apps/mfe-state-demo-vue/`
- **Framework**: Vue 3
- **Purpose**: Universal state management demo

#### Key Features:

- Same functionality as React version
- Proves framework-agnostic state management
- Vue composition API integration
- Real-time synchronization with React/Vanilla MFEs

### 6. mfe-state-demo-vanilla

- **Location**: `apps/mfe-state-demo-vanilla/`
- **Framework**: Vanilla TypeScript
- **Purpose**: Universal state management demo

#### Key Features:

- Pure TypeScript implementation
- No framework dependencies
- Same state synchronization capabilities
- DOM manipulation for UI updates

## Common Patterns Observed

### InfoBlock Component Pattern

All MFEs implemented their own version of InfoBlock:

```tsx
const InfoBlock = ({ title, sections, className }) => (
  <div className={`bg-muted/50 rounded-lg p-6 ${className}`}>
    <h3 className="font-semibold mb-3">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      {sections.map((section, index) => (
        <div key={index}>
          <span className="text-muted-foreground">{section.label}:</span>
          <p className={`font-medium ${section.highlight ? 'text-primary' : ''}`}>
            {section.value}
          </p>
        </div>
      ))}
    </div>
  </div>
);
```

### Event Log Pattern

Consistent event logging UI across all MFEs:

- Timestamp display
- Event type (sent/received)
- Event name and payload
- Maximum 10 events in log
- Clear log functionality

### Service Integration Pattern

All MFEs followed the same service integration:

```tsx
export default function mount(element: HTMLElement, services: MFEServices) {
  // Use services.modal, services.notification, services.eventBus, etc.
  const root = ReactDOM.createRoot(element);
  root.render(<App services={services} />);

  return {
    unmount: () => root.unmount(),
  };
}
```

## Migration to Service Demo Approach

These monolithic service explorers are being replaced with focused, single-service demos:

### Old Structure (Removed):

- One MFE demonstrating ALL services
- 500+ lines per MFE
- Difficult to understand individual services
- Duplicate code across framework versions

### New Structure (Implemented):

- One MFE per service per framework
- ~200 lines per MFE
- Clear, focused demonstrations
- Side-by-side framework comparisons
- Example: `apps/service-demos/modal/mfe-react19-modal-demo/`

## Key Learnings

1. **Service Injection Works Well**: The pattern of injecting services at mount time proved robust across all framework versions

2. **State Management Complexity**: The Zustand integration in React 17 had conflicts due to bundled React versions, highlighting the importance of careful dependency management

3. **Event Bus is Central**: Every MFE used the event bus extensively, making it a critical service for inter-MFE communication

4. **UI Consistency Needed**: The duplicate InfoBlock implementations and varying typography/spacing showed the need for a unified design system

5. **Framework Agnostic Approach Validated**: The state demos proved that truly framework-agnostic state management is achievable with the right architecture

## Archived Code References

The full source code for these MFEs has been preserved in the git history at commit [previous commit hash before removal]. Key patterns and implementations have been extracted and will be reimplemented in the new service demo structure with improved consistency and design system integration.
