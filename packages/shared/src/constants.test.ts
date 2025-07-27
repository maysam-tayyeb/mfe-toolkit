import { describe, it, expect } from 'vitest';
import { APP_NAME, ROUTES, EVENTS } from './constants';

describe('constants', () => {
  describe('APP_NAME', () => {
    it('should have correct app name', () => {
      expect(APP_NAME).toBe('MFE Platform');
    });
  });

  describe('ROUTES', () => {
    it('should have correct route paths', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.DASHBOARD).toBe('/dashboard');
      expect(ROUTES.MFE).toBe('/mfe/:mfeName');
    });
  });

  describe('EVENTS', () => {
    it('should have correct event names', () => {
      expect(EVENTS.AUTH_CHANGED).toBe('auth:changed');
      expect(EVENTS.MFE_LOADED).toBe('mfe:loaded');
      expect(EVENTS.MFE_ERROR).toBe('mfe:error');
      expect(EVENTS.NAVIGATION).toBe('navigation:change');
    });
  });
});
