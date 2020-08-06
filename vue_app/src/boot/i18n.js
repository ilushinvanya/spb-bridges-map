import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from 'src/i18n'

Vue.use(VueI18n)
const navigator_language = window.navigator.language;
let app_language = "ru";
if (navigator_language) {
    if (navigator_language.includes("ru")) {
      app_language = "ru"
    } else if (navigator_language.includes("en")) {
      app_language = "en"
    } else if (navigator_language.includes("zh")) {
      app_language = "ch"
    }
}


const i18n = new VueI18n({
  locale: localStorage.getItem("spb_bridges_language") || app_language,
  fallbackLocale: 'en',
  messages
})

export default ({ app }) => {
  // Set i18n instance on app
  app.i18n = i18n
}

export { i18n }
