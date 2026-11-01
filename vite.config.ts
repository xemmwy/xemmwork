import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// The site builds to ../website: one index.html (code, styles and content inlined) plus work/ with the images,
// so it opens straight from disk and can be uploaded to any static host as is.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { outDir: '../website', emptyOutDir: true, assetsInlineLimit: 100_000_000 },
})
