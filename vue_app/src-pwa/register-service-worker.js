import { register } from 'register-service-worker'
import { Notify } from 'quasar'
// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
  },

  registered (/* registration */) {
    // console.log('Service worker has been registered.')
  },

  cached (/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound (/* registration */) {
    // console.log('New content is downloading.')
  },

  updated (/* registration */) {
    // console.log('New content is available; please refresh.')
    Notify.create({
      color: 'primary',
      icon: 'cloud_download',
      message: 'Есть обновления<br/> Нажмите "Обновить", чтобы скачать новую версию',
      timeout: 0,
      html: true,
      multiLine: true,
      position: 'center',
      actions: [
        {
          label: 'Обновить',
          color: 'yellow',
          handler: () => {
            window.location.reload()
          }
        }
      ]
    })
  },

  offline () {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  }
})
