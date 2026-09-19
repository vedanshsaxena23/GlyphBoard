// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

// Support both ESM and CJS import variations for the monaco plugin
const monacoPlugin = monacoEditorPlugin.default || monacoEditorPlugin

export default defineConfig({
  plugins: [
    react({ compiler: true }),
    monacoPlugin({
      languageWorkers: ['editorWorkerService', 'typescript', 'json', 'html', 'css'],
    }),
  ],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        splash: resolve(import.meta.dirname, 'splash/index.html'),
      },
    },
    outDir: 'dist',
  },
})