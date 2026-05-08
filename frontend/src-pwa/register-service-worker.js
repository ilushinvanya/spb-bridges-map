import { register } from 'register-service-worker'
import { Notify } from 'quasar'
import { i18n } from 'boot/i18n'

register(process.env.SERVICE_WORKER_FILE, {
  ready (/* registration */) {
  },

  registered (/* registration */) {
  },

  cached (/* registration */) {
  },

  updatefound (/* registration */) {
  },

  updated (/* registration */) {
    Notify.create({
      color: 'primary',
      icon: 'cloud_download',
      message: i18n.global.t('update_available'),
      timeout: 0,
      html: true,
      multiLine: true,
      position: 'center',
      actions: [
        {
          label: 'Ok',
          color: 'yellow',
          handler: () => {
            window.location.reload(true)
          }
        }
      ]
    })
  },

  offline () {
  },

  error (/* err */) {
  }
})
