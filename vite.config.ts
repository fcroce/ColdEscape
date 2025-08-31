import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import checker from 'vite-plugin-checker'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  base: '/ColdEscape', // https://fcroce.github.io/ColdEscape/
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
    viteStaticCopy({
      targets: [
        {
          src: 'public/TropicalSunnyDay',
          dest: 'ColdEscape/TropicalSunnyDay',
        },
        {
          src: 'public/Dome.glb',
          dest: 'ColdEscape/Dome.glb',
        },
      ],
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
