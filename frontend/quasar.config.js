import { defineConfig } from '#q-app/wrappers'

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
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20',
      },
      typescript: {
        strict: true,
        vueShim: true,
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
