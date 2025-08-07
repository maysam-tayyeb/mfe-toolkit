/**
 * Design System ES Module Exports
 * Pure exports with no side effects or global pollution
 * Import these explicitly in your MFEs
 */

// Token exports
export * from './tokens';

// Pattern exports
export * from './patterns';

// Class name mappings for programmatic use
export const classNames = {
  // Cards
  card: 'ds-card',
  cardPadded: 'ds-card-padded',
  cardCompact: 'ds-card-compact',
  cardElevated: 'ds-card ds-card-elevated',
  cardInteractive: 'ds-card ds-card-interactive',
  
  // Buttons
  button: 'ds-button',
  buttonPrimary: 'ds-button-primary',
  buttonSecondary: 'ds-button-secondary',
  buttonOutline: 'ds-button-outline',
  buttonGhost: 'ds-button-ghost',
  buttonDestructive: 'ds-button-destructive',
  
  // Typography
  h1: 'ds-h1',
  h2: 'ds-h2',
  h3: 'ds-h3',
  h4: 'ds-h4',
  textMuted: 'ds-text-muted',
  textSmall: 'ds-text-small',
  textXs: 'ds-text-xs',
  
  // Layout
  container: 'ds-container',
  containerNarrow: 'ds-container-narrow',
  section: 'ds-section',
  grid2: 'ds-grid-2',
  grid3: 'ds-grid-3',
  grid4: 'ds-grid-4',
  stack: 'ds-stack',
  stackSm: 'ds-stack-sm',
  stackLg: 'ds-stack-lg',
  
  // Forms
  input: 'ds-input',
  textarea: 'ds-textarea',
  label: 'ds-label',
  formGroup: 'ds-form-group',
  
  // Badges
  badge: 'ds-badge',
  badgeDefault: 'ds-badge-default',
  badgePrimary: 'ds-badge-primary',
  badgeSuccess: 'ds-badge-success',
  badgeWarning: 'ds-badge-warning',
  badgeError: 'ds-badge-error',
  
  // Alerts
  alert: 'ds-alert',
  alertInfo: 'ds-alert-info',
  alertSuccess: 'ds-alert-success',
  alertWarning: 'ds-alert-warning',
  alertError: 'ds-alert-error',
} as const;

// Re-export commonly used combinations
export const patterns = {
  card: {
    default: 'ds-card-padded',
    compact: 'ds-card-compact',
    elevated: 'ds-card-padded ds-card-elevated',
    interactive: 'ds-card-padded ds-card-interactive',
  },
  button: {
    primary: 'ds-button-primary',
    secondary: 'ds-button-secondary',
    outline: 'ds-button-outline',
    ghost: 'ds-button-ghost',
    destructive: 'ds-button-destructive',
    primarySmall: 'ds-button-primary ds-button-sm',
    primaryLarge: 'ds-button-primary ds-button-lg',
  },
  layout: {
    page: 'ds-container ds-section',
    pageNarrow: 'ds-container-narrow ds-section',
    cardGrid: 'ds-grid-3',
    formStack: 'ds-stack',
  },
} as const;

// Version for cache busting
export const version = '1.0.0';

// CSS URL for reference (when served)
export const cssUrl = '/design-system/design-system.css';
