import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // تأكد من وجود هذا السطر
  base: '/',
  // 👇 سيبها زي ما هي
  // 👇 Use '/' by default (for Vercel and local) and '/share_in_dashbord/' for GitHub Pages
  // base: (command === 'serve' || process.env.VERCEL) ? '/' : '/share_in_dashbord/',

  // 👇 الإضافة الجديدة
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
