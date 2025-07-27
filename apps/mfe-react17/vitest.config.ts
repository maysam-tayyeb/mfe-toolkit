import { createVitestConfig } from '../../vitest.config.base';
import { mergeConfig } from 'vite';

const baseConfig = createVitestConfig({ root: __dirname });

export default mergeConfig(baseConfig, {
  test: {
    coverage: {
      exclude: [
        ...baseConfig.test?.coverage?.exclude || [],
        'build.js',
        'src/main.tsx', // Exclude main.tsx since it's mostly boilerplate
      ],
    },
  },
});