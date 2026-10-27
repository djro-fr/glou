import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    // MapLibre GL is ~1 MB minified and already lazy-loaded in its own chunk
    chunkSizeWarningLimit: 1100,
  },
})
