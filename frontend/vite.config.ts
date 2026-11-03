import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  envDir: fileURLToPath(new URL('../', import.meta.url)),
  plugins: [svelte()],
  build: {
    // MapLibre GL is ~1 MB minified and already lazy-loaded in its own chunk
    chunkSizeWarningLimit: 1100,
  },
})
