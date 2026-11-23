import { defineBoot } from '@quasar/app-vite'
import { createI18n } from 'vue-i18n'
import messages from '../i18n/index.js'

const navigator_language = window.navigator.language
let app_language = 'ru'
if (navigator_language) {
  if (navigator_language.includes('ru')) {
    app_language = 'ru'
  } else if (navigator_language.includes('en')) {
    app_language = 'en'
  } else if (navigator_language.includes('zh')) {
    app_language = 'ch'
  }
}

export const i18n = createI18n({
  locale: localStorage.getItem('spb_bridges_language') || app_language,
  fallbackLocale: 'en',
  legacy: false,
  messages
})

export default defineBoot(({ app }) => {
  app.use(i18n)
})
