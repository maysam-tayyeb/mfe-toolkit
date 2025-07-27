export const APP_NAME = 'MFE Platform';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  MFE: '/mfe/:mfeName',
} as const;

export const EVENTS = {
  AUTH_CHANGED: 'auth:changed',
  MFE_LOADED: 'mfe:loaded',
  MFE_ERROR: 'mfe:error',
  NAVIGATION: 'navigation:change',
} as const;