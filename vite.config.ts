import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/fundamental-matrix-demo/',
  build: {
    outDir: 'docs',
  },
  plugins: [react()],
})
