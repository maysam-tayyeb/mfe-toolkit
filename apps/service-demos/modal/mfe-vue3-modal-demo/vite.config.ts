import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3107
  },
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'MfeVue3ModalDemo',
      fileName: 'mfe-vue3-modal-demo',
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});