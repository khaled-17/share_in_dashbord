import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use '/' for development, '/share_in_dashbord/' for production (GitHub Pages)
  base: command === 'serve' ? '/' : '/share_in_dashbord/',
}))
