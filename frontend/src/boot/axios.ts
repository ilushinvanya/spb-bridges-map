import { defineBoot } from '@quasar/app-vite'
import axios from 'axios'

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
})

export { axios }
