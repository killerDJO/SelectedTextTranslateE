import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: './src',
  plugins: [vue(), commonjs(), visualizer({ filename: './dist/stats.html' })],
  build: {
    outDir: '../../../dist/app/renderer',
    sourcemap: 'inline',
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      input: {
        index: './src/index.html'
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      },
      external: ['electron']
    },
    emptyOutDir: false
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "sass:math"; @import "./src/css/framework.scss";`
      }
    }
  },

  base: './'
});
