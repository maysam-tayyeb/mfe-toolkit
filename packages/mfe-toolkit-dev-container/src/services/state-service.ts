/**
 * Development State Manager Service
 * Provides state management for MFE development
 */

import type { StateManager } from '@mfe-toolkit/core';

export class DevStateManager implements StateManager {
  private state: Map<string, any> = new Map();
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  get<T>(key: string): T | undefined {
    return this.state.get(key);
  }

  set<T>(key: string, value: T): void {
    const oldValue = this.state.get(key);
    this.state.set(key, value);
    
    console.log(`[DevStateManager] State updated: ${key}`, { oldValue, newValue: value });
    
    // Notify listeners
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => {
        try {
          listener(value);
        } catch (error) {
          console.error(`[DevStateManager] Error in listener for ${key}:`, error);
        }
      });
    }
  }

  delete(key: string): boolean {
    const existed = this.state.has(key);
    this.state.delete(key);
    
    if (existed) {
      console.log(`[DevStateManager] State deleted: ${key}`);
      
      // Notify listeners with undefined
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.forEach(listener => {
          try {
            listener(undefined);
          } catch (error) {
            console.error(`[DevStateManager] Error in listener for ${key}:`, error);
          }
        });
      }
    }
    
    return existed;
  }

  has(key: string): boolean {
    return this.state.has(key);
  }

  clear(): void {
    const keys = Array.from(this.state.keys());
    this.state.clear();
    
    console.log('[DevStateManager] State cleared');
    
    // Notify all listeners
    keys.forEach(key => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.forEach(listener => {
          try {
            listener(undefined);
          } catch (error) {
            console.error(`[DevStateManager] Error in listener for ${key}:`, error);
          }
        });
      }
    });
  }

  subscribe<T>(key: string, callback: (value: T | undefined) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    const keyListeners = this.listeners.get(key)!;
    keyListeners.add(callback);
    
    // Call with current value
    callback(this.state.get(key));
    
    // Return unsubscribe function
    return () => {
      keyListeners.delete(callback);
      if (keyListeners.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  getState(): Record<string, any> {
    return Object.fromEntries(this.state);
  }

  setState(state: Record<string, any>): void {
    Object.entries(state).forEach(([key, value]) => {
      this.set(key, value);
    });
  }
}