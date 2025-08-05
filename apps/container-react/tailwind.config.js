/** @type {import('tailwindcss').Config} */
import baseConfig from '../../tailwind.config.base.js';

export default {
  ...baseConfig,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
};
