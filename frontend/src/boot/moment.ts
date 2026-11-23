import { defineBoot } from '@quasar/app-vite'
import moment from 'moment'

export default defineBoot(({ app }) => {
  app.config.globalProperties.$moment = moment
})

export { moment }
