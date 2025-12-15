import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const productionBase =
    process.env.VITE_APP_BASE_PATH ||
    process.env.BASE_PATH ||
    '/';

  return {
    plugins: [react()],
    base: command === 'serve' ? '/' : productionBase,
    server: {
      port: 5200,
      host: true
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
