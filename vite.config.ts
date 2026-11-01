import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Locally the site builds to ../website: one index.html (code, styles and content inlined) plus work/ with the
// images, so it opens straight from disk. On Vercel (which sets VERCEL=1) it builds to dist inside the repo.
const outDir = process.env.VERCEL ? 'dist' : '../website'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: { outDir, emptyOutDir: true, assetsInlineLimit: 100_000_000 },
})
