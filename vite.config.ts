import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // The 350-card dataset is ~380 kB of JSON. Give it its own chunk so
        // code-only deploys don't invalidate it in the browser cache.
        codeSplitting: {
          groups: [{ name: 'cards-data', test: /src[\\/]data[\\/].*\.json$/ }],
        },
      },
    },
  },
})
