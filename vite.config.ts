import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Every px font size (each text-[13px] utility and the hand-written rules in
// index.css) is multiplied by the --fs custom property, so a theme can scale
// all type at once — light mode sets it a step above 1. Idempotent: an already
// wrapped value no longer matches.
const PX_FONT_SIZE = /font-size:\s*(\d+(?:\.\d+)?)px/g
const scaleFontSize = (css: string) => css.replace(PX_FONT_SIZE, 'font-size:calc($1px * var(--fs, 1))')

function scalablePxFontSizes(): Plugin {
  return {
    name: 'rsp-scalable-px-font-sizes',
    enforce: 'post',
    transform(code, id) {
      if (!/\.css($|\?)/.test(id)) return null
      return { code: scaleFontSize(code), map: null }
    },
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && file.fileName.endsWith('.css') && typeof file.source === 'string') {
          file.source = scaleFontSize(file.source)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), scalablePxFontSizes()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
