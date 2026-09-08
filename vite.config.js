import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Pure static SPA. Landing.vue calls https://domains-api.lisaos.dev
// directly (cross-origin), so no dev proxy is needed. For local dev
// against localhost, change the fetch URL in Landing.vue temporarily
// or set up a /etc/hosts mapping for domains-api.lisaos.dev.
export default defineConfig({
  plugins: [vue()],
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log', 'console.debug', 'console.info'],
  },
  server: { port: 3056 },
  build: { outDir: 'dist' },
})
