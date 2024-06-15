import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue(), visualizer({ filename: './dist/stats.html' })],

  base: './',
  // build: {
  //   sourcemap: 'inline',
  //   chunkSizeWarningLimit: 10000,
  //   rollupOptions: {
  //     input: {
  //       index: './index.html'
  //     },
  //     output: {
  //       manualChunks(id) {
  //         if (id.includes('node_modules')) {
  //           return 'vendor';
  //         }
  //       }
  //     }
  //   },
  //   emptyOutDir: false
  // },
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

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**']
    }
  }
}));
