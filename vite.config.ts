import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import checker from 'vite-plugin-checker'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: 'ColdEscape', // https://fcroce.github.io/ColdEscape/
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: `assets/[name]-[hash][extname]`,
        chunkFileNames: `assets/js/[name]-[hash].js`,
        entryFileNames: `assets/js/[name]-[hash].js`,
      },
    },
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
