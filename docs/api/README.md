# API Reference

This directory contains API documentation for all packages in the MFE Made Easy platform.

## 📦 Packages

### [@mfe/dev-kit](../../packages/mfe-dev-kit/README.md)
Core development kit for building MFEs
- TypeScript interfaces
- MFELoader component
- Service definitions
- Event bus implementation

### [@mfe/shared](../../packages/shared/README.md)
Shared utilities and constants
- Common constants
- Helper functions
- Type definitions

### [@mfe/design-system](../../packages/design-system/README.md)
Shared UI components and design tokens
- ShadCN components
- Tailwind configuration
- Theme system

## 🔌 Core APIs

### MFE Module Interface
```typescript
interface MFEModule {
  mount(element: HTMLElement, services: MFEServices): void;
  unmount?(): void;
}
```

### MFE Services
```typescript
interface MFEServices {
  auth: AuthService;
  modal: ModalService;
  notification: NotificationService;
  eventBus: EventBus;
  logger: Logger;
}
```

### Event Bus API
```typescript
interface EventBus {
  emit(event: string, data: any): void;
  on(event: string, handler: Function): () => void;
  off(event: string, handler: Function): void;
}
```

## 📋 Coming Soon

- [ ] Detailed service API documentation
- [ ] TypeScript API reference
- [ ] REST API documentation (if applicable)
- [ ] GraphQL schema documentation (if applicable)
- [ ] WebSocket event documentation

---

*For implementation examples, see the [guides](../guides/) section.*