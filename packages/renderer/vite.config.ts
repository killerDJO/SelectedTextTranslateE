import { defineConfig, type PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: './src',
  plugins: [
    vue(),
    commonjs() as PluginOption,
    visualizer({ filename: './dist/stats.html' }) as PluginOption
  ],
  build: {
    outDir: '../../../dist/app/renderer',
    sourcemap: 'inline',
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      input: {
        index: './src/index.html',
        preload: './src/preload.ts'
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      },
      external: ['electron']
    }
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
