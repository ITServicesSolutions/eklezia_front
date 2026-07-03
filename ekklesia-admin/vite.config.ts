import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_BASE_URL || env.VITE_API_URL

  if (!target) {
    throw new Error('Missing VITE_API_BASE_URL (or VITE_API_URL) for Vite proxy.')
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          timeout: 60000, // 60 secondes
        },
      },
    },
  }
})
