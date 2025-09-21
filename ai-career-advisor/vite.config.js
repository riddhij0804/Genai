import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',      // ← ensures assets load correctly on Render
  plugins: [react()],
})
