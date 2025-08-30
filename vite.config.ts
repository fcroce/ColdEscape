import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import checker from 'vite-plugin-checker'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'docs',
  },
  resolve: {
    alias: {
      '$components': resolve('./src/components'),
    },
  },
  plugins: [
    vue(),
    tsconfigPaths(),
    checker({
    typescript: true,
    }),
  ],
  optimizeDeps: {
    include: [
      'vue',
    ],
    exclude: [
      '@babylonjs/havok',
    ],
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true
    }
  },
})
