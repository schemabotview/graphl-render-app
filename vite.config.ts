import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Tailwind v4 via its Vite plugin — no PostCSS/tailwind.config needed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
