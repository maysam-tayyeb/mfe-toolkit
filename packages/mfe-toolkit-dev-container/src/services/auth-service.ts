/**
 * Development Auth Service
 * Provides mock authentication for MFE development
 */

import type { AuthService, User } from '@mfe-toolkit/core';
import { EventBus } from '@mfe-toolkit/core';

export interface AuthMockConfig {
  isAuthenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  roles?: string[];
  permissions?: string[];
}

export class DevAuthService implements AuthService {
  private isAuthenticated: boolean;
  private currentUser: User | null;
  private roles: string[];
  private permissions: string[];
  private eventBus: EventBus;

  constructor(mockConfig?: boolean | AuthMockConfig) {
    this.eventBus = new EventBus();
    
    if (mockConfig === true) {
      // Default mock auth
      this.isAuthenticated = true;
      this.currentUser = {
        id: 'dev-user-123',
        name: 'Dev User',
        email: 'dev@example.com',
      };
      this.roles = ['user'];
      this.permissions = ['read'];
    } else if (typeof mockConfig === 'object' && mockConfig !== null) {
      // Custom mock auth
      this.isAuthenticated = mockConfig.isAuthenticated;
      this.currentUser = mockConfig.user || null;
      this.roles = mockConfig.roles || [];
      this.permissions = mockConfig.permissions || [];
    } else {
      // No auth
      this.isAuthenticated = false;
      this.currentUser = null;
      this.roles = [];
      this.permissions = [];
    }
  }

  async login(credentials: any): Promise<void> {
    console.log('[DevAuthService] Login attempt:', credentials);
    
    // Simulate login
    this.isAuthenticated = true;
    this.currentUser = {
      id: 'user-' + Date.now(),
      name: credentials.username || 'Test User',
      email: credentials.email || 'test@example.com',
    };
    this.roles = ['user'];
    this.permissions = ['read', 'write'];
    
    this.eventBus.emit('auth:login', { user: this.currentUser });
  }

  async logout(): Promise<void> {
    console.log('[DevAuthService] Logout');
    
    const previousUser = this.currentUser;
    this.isAuthenticated = false;
    this.currentUser = null;
    this.roles = [];
    this.permissions = [];
    
    this.eventBus.emit('auth:logout', { user: previousUser });
  }

  async refreshToken(): Promise<void> {
    console.log('[DevAuthService] Token refresh (simulated)');
    // In dev mode, just log the refresh
  }

  getToken(): string | null {
    return this.isAuthenticated ? 'dev-token-' + Date.now() : null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const handler = (event: any) => {
      callback(event.user || null);
    };
    
    this.eventBus.on('auth:login', handler);
    this.eventBus.on('auth:logout', handler);
    
    // Return unsubscribe function
    return () => {
      this.eventBus.off('auth:login', handler);
      this.eventBus.off('auth:logout', handler);
    };
  }
}