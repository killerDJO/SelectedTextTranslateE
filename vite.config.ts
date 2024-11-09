import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'node:path';

const WITH_STATS = !!process.env.WITH_STATS;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue(),
    WITH_STATS ? visualizer({ filename: './dist/stats.html', sourcemap: true }) : undefined
  ],

  base: './',

  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        index: './index.html'
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    sourcemap: WITH_STATS
  },

  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
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
