import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const base = process.env.VERCEL ? '/' : '/Panda-Bubble-Tea/'

export default defineConfig({
  base,

  server: {
    open: base
  },

  preview: {
    open: base
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        menu: resolve('menu.html'),
        checkout: resolve('checkout.html'),
        contact: resolve('contact.html')
      }
    }
  }
})
