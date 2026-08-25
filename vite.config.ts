import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  build: {
    // Firebase Auth + Firestore SDK exceeds the default 500 kB warning.
    // This is expected for a Firebase-powered app with modular imports.
    chunkSizeWarningLimit: 900,
  },
})
