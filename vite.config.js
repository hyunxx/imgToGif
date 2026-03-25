import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // '/api'로 시작하는 요청을 Vercel 서버리스 함수로 전달합니다.
      '/api': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
      },
    },
  }
})
