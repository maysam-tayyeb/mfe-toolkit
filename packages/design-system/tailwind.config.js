/** @type {import('tailwindcss').Config} */
const baseConfig = require('../../tailwind.config.base.js');

module.exports = {
  ...baseConfig,
  content: ['./src/**/*.{ts,tsx,css}'],
  // Disable tree-shaking - include all design system classes
  safelist: [
    // Generate all ds-* classes regardless of usage
    { pattern: /^ds-.*/ },
    // Include all dark mode variants
    { pattern: /^dark:.*/ },
  ],
};
