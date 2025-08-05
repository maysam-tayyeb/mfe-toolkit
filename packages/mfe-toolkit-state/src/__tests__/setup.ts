import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Store all broadcast channels for cross-channel communication in tests
const channels = new Map<string, Set<MockBroadcastChannel>>();

// Mock BroadcastChannel if not available
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  
  constructor(name: string) {
    this.name = name;
    // Register this channel
    if (!channels.has(name)) {
      channels.set(name, new Set());
    }
    channels.get(name)!.add(this);
  }
  
  postMessage(message: any) {
    // Broadcast to all other channels with the same name
    const channelSet = channels.get(this.name);
    if (channelSet) {
      channelSet.forEach(channel => {
        if (channel !== this && channel.onmessage) {
          // Simulate async message delivery
          setTimeout(() => {
            const event = new MessageEvent('message', { data: message });
            channel.onmessage!(event);
          }, 0);
        }
      });
    }
  }
  
  close() {
    // Unregister this channel
    const channelSet = channels.get(this.name);
    if (channelSet) {
      channelSet.delete(this);
      if (channelSet.size === 0) {
        channels.delete(this.name);
      }
    }
  }
  
  addEventListener() {
    // No-op for tests
  }
  
  removeEventListener() {
    // No-op for tests
  }
  
  dispatchEvent() {
    return true;
  }
}

// @ts-ignore
globalThis.BroadcastChannel = MockBroadcastChannel;

// Clear channels between tests
beforeEach(() => {
  channels.clear();
});

// Mock localStorage if not available
class LocalStorageMock implements Storage {
  private store: { [key: string]: string } = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

if (typeof localStorage === 'undefined') {
  (globalThis as any).localStorage = new LocalStorageMock();
}