import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react({compiler: true})],
  base: './',
  optimizeDeps: {
    include: [
      '@monaco-editor/react',
      'monaco-editor/esm/vs/editor/editor.worker'
    ],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),     
        splash: resolve(__dirname, 'splash/index.html')
      }
    },
    outDir: 'dist'
  }
})
