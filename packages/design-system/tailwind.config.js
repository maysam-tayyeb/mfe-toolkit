/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,css}'],
  theme: {
    extend: {
      colors: {
        // Semantic color tokens that use CSS variables
        // This allows themes to override colors without changing the design system
        primary: {
          DEFAULT: 'rgb(var(--ds-color-primary) / <alpha-value>)',
          hover: 'rgb(var(--ds-color-primary-hover) / <alpha-value>)',
          soft: 'rgb(var(--ds-color-primary-soft) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--ds-color-secondary) / <alpha-value>)',
          hover: 'rgb(var(--ds-color-secondary-hover) / <alpha-value>)',
          soft: 'rgb(var(--ds-color-secondary-soft) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--ds-color-surface) / <alpha-value>)',
          secondary: 'rgb(var(--ds-color-surface-secondary) / <alpha-value>)',
          muted: 'rgb(var(--ds-color-surface-muted) / <alpha-value>)',
        },
        text: {
          DEFAULT: 'rgb(var(--ds-color-text) / <alpha-value>)',
          secondary: 'rgb(var(--ds-color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--ds-color-text-muted) / <alpha-value>)',
          inverse: 'rgb(var(--ds-color-text-inverse) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--ds-color-border) / <alpha-value>)',
          secondary: 'rgb(var(--ds-color-border-secondary) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--ds-color-success) / <alpha-value>)',
          soft: 'rgb(var(--ds-color-success-soft) / <alpha-value>)',
          text: 'rgb(var(--ds-color-success-text) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--ds-color-warning) / <alpha-value>)',
          soft: 'rgb(var(--ds-color-warning-soft) / <alpha-value>)',
          text: 'rgb(var(--ds-color-warning-text) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--ds-color-danger) / <alpha-value>)',
          soft: 'rgb(var(--ds-color-danger-soft) / <alpha-value>)',
          text: 'rgb(var(--ds-color-danger-text) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--ds-color-info) / <alpha-value>)',
          soft: 'rgb(var(--ds-color-info-soft) / <alpha-value>)',
          text: 'rgb(var(--ds-color-info-text) / <alpha-value>)',
        },
      },
    },
  },
  // Disable tree-shaking - include all design system classes
  safelist: [
    // Generate all ds-* classes regardless of usage
    { pattern: /^ds-.*/ },
  ],
  plugins: [],
};
