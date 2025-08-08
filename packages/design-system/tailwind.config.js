/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,css}'],
  theme: {
    extend: {
      // Design system can define its own theme extensions if needed
    },
  },
  // Disable tree-shaking - include all design system classes
  safelist: [
    // Generate all ds-* classes regardless of usage
    { pattern: /^ds-.*/ },
  ],
  plugins: [],
};
