import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const envDir = fileURLToPath(new URL('../', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, envDir, 'VITE_');
  if (command === 'build' && !env.VITE_API_URL) {
    throw new Error('VITE_API_URL is missing: set it in the root .env or as a GitHub Actions variable')
  }
  return {
    envDir,
    plugins: [svelte()],
    build: {
      // MapLibre GL is ~1 MB minified and already lazy-loaded in its own chunk
      chunkSizeWarningLimit: 1100
    }
  }
})
