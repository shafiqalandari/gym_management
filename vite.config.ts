import { defineConfig } from 'vite'

// React JSX is compiled by Vite's built-in esbuild integration.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  build: { target: 'es2018', cssMinify: true },
})
