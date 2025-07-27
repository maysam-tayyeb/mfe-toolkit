const baseConfig = require('../../tailwind.config.base');

module.exports = {
  ...baseConfig,
  content: [...baseConfig.content, './index.html', './src/**/*.{js,ts,jsx,tsx}'],
};
