import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  optimizeDeps: {
    // Force Vite to pre-bundle the monaco editor dependencies locally
    include: [
      `@monaco-editor/react`,
      `monaco-editor/esm/vs/editor/editor.worker`
    ],
  },
})
