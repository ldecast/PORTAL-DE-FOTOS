import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxRuntime: 'classic'
    })
  ],
  build: {
    emptyOutDir: true,
    outDir: '../dist'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './assets')
    }
  },
  esbuild: {
    jsxInject: `import React from 'react'`
  },
  css: {
    modules:
      mode === 'development'
        ? {
            generateScopedName: (name, filename, css) => {
              const index = css.indexOf(`.${name}`)
              const line = css.substr(0, index).split(/[\r\n]/).length

              const file = path.basename(filename).split('.')[0]

              return `${file}_${name}_${line}`
            }
          }
        : {}
  }
}))
