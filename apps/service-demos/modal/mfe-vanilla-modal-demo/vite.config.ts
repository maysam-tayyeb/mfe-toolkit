import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3108,
  },
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'MfeVanillaModalDemo',
      fileName: 'mfe-vanilla-modal-demo',
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
      output: {},
    },
  },
});
