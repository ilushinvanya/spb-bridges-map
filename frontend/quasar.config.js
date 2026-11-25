import { defineConfig } from '@quasar/app-vite'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { visualizer } from 'rollup-plugin-visualizer'

// Явно загружаем .env файл
dotenv.config()

export default defineConfig(function (/* ctx */) {
  return {
    boot: [
      'moment',
      'i18n',
      'axios',
      'hawk',
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
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Pages - отдельно
            if (id.includes('src/pages/Index')) return 'pages/Index'
            if (id.includes('src/pages/Error404')) return 'pages/Error404'

            // Всё остальное - в vendor
            return 'vendor'
          },
          // Минимальный размер чанка для объединения маленьких модулей
          minChunkSize: 100000,
          // Компактное имя для файлов
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: (chunkInfo) => {
            if (chunkInfo.name && chunkInfo.name.startsWith('pages/')) {
              return 'js/pages/[name]-[hash].js'
            }
            return 'js/vendor-[hash].js'
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name.endsWith('.svg')) {
              return 'svg/[name]-[hash][extname]'
            }
            if (assetInfo.name.endsWith('.css')) {
              return 'css/[name]-[hash][extname]'
            }
            if (/\.(woff2|woff|ttf|eot)$/i.test(assetInfo.name)) {
              return 'fonts/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
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

        // Расширяем Rollup конфиг
        if (!viteConf.build.rollupOptions) {
          viteConf.build.rollupOptions = { output: {} }
        }
        if (!viteConf.build.rollupOptions.output) {
          viteConf.build.rollupOptions.output = {}
        }

        // Усиливаем логику разбиения чанков
        const originalManualChunks = viteConf.build.rollupOptions.output.manualChunks

        viteConf.build.rollupOptions.output.manualChunks = (id) => {
          // Если уже определено - возвращаем
          if (typeof originalManualChunks === 'function') {
            const result = originalManualChunks(id)
            if (result) return result
          }

          // Pages - отдельно
          if (id.includes('src/pages/Index')) return 'pages/Index'
          if (id.includes('src/pages/Error404')) return 'pages/Error404'

          // Всё остальное - в vendor
          return 'vendor'
        }

        // Добавляем visualizer только при production сборке
        if (process.env.ANALYZE === 'true') {
          viteConf.plugins.push(
            visualizer({
              open: true,
              gzipSize: true,
              brotliSize: true,
              filename: 'dist/pwa/stats.html',
            })
          )
        }
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
