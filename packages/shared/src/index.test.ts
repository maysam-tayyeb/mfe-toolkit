import { describe, it, expect } from 'vitest';
import * as sharedExports from './index';

describe('index exports', () => {
  it('should export all utilities from utils', () => {
    expect(sharedExports.cn).toBeDefined();
    expect(sharedExports.delay).toBeDefined();
    expect(sharedExports.generateId).toBeDefined();
  });

  it('should export all constants', () => {
    expect(sharedExports.APP_NAME).toBeDefined();
    expect(sharedExports.ROUTES).toBeDefined();
    expect(sharedExports.EVENTS).toBeDefined();
  });
});
