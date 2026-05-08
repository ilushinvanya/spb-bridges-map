import { defineBoot } from '#q-app/wrappers'
import moment from 'moment'

export default defineBoot(({ app }) => {
  app.config.globalProperties.$moment = moment
})

export { moment }
