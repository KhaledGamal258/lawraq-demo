import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(projectRoot, 'index.html'),
        legacyDemoRedirect: resolve(projectRoot, 'demo.html'),
        tour: resolve(projectRoot, 'tour/index.html'),
      },
    },
  },
})
