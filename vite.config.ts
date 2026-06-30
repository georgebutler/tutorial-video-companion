import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'node:fs'
import path from 'node:path'

const privateTutorialContentPath = path.resolve(__dirname, './src/content/private/tutorialContent.ts')
const publicTutorialContentPath = path.resolve(__dirname, './src/content/public/tutorialContent.ts')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tutorial-content': existsSync(privateTutorialContentPath)
        ? privateTutorialContentPath
        : publicTutorialContentPath,
    },
  },
})
