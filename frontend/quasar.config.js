import { defineConfig } from '@quasar/app-vite'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// Явно загружаем .env файл
dotenv.config()

console.log('=== Environment Check ===')
console.log('VITE_MAPBOX_TOKEN:', process.env.VITE_MAPBOX_TOKEN ? 'loaded' : 'MISSING')
console.log('VITE_WEBCAM_URL:', process.env.VITE_WEBCAM_URL ? 'loaded' : 'MISSING')
console.log('========================')

export default defineConfig(function (/* ctx */) {
  return {
    boot: [
      'moment',
      'i18n',
      'axios',
    ],

    css: [
      'app.sass'
    ],

    extras: [
      'material-icons',
    ],

    build: {
      vueRouterMode: 'hash',
      target: {
        browser: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
        node: 'node20',
      },
      env: {
        VITE_MAPBOX_TOKEN: process.env.VITE_MAPBOX_TOKEN,
        VITE_WEBCAM_URL: process.env.VITE_WEBCAM_URL,
        VITE_API_DOMAIN: process.env.VITE_API_DOMAIN,
        VITE_YM_ID: process.env.VITE_YM_ID,
      },
      extendViteConf (viteConf) {
        Object.assign(viteConf.resolve.alias, {
          src: fileURLToPath(new URL('./src', import.meta.url)),
          boot: fileURLToPath(new URL('./src/boot', import.meta.url)),
          layouts: fileURLToPath(new URL('./src/layouts', import.meta.url)),
          pages: fileURLToPath(new URL('./src/pages', import.meta.url)),
          components: fileURLToPath(new URL('./src/components', import.meta.url)),
          stores: fileURLToPath(new URL('./src/stores', import.meta.url)),
        })
      },
    },

    devServer: {
      open: true,
      port: 8080,
    },

    framework: {
      config: {},
      plugins: ['Notify'],
    },

    animations: [],

    pwa: {
      workboxMode: 'GenerateSW',
      extendGenerateSWOptions (cfg) {
        cfg.skipWaiting = true
        cfg.clientsClaim = true
      },
      manifest: {
        name: 'Разводные мосты Петербурга',
        short_name: 'Разводные мосты Петербурга',
        description: 'Актуальная онлайн-карта, расписание и график разводных мостов в Санкт-Петербурге через Неву.',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#78909c',
        icons: [
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'maskable any' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
          { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png', purpose: 'maskable any' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'maskable any' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' }
        ]
      }
    },
  }
})
