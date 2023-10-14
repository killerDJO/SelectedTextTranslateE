import commonjs from '@rollup/plugin-commonjs';
import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  plugins: [commonjs()],
  build: {
    outDir: '../../../dist/app/renderer',
    sourcemap: 'inline',
    chunkSizeWarningLimit: 100000,
    rollupOptions: {
      input: {
        preload: './src/preload.ts'
      },
      external: ['electron']
    },
    emptyOutDir: false
  }
});
