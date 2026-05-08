<template>
  <router-view />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useBridgesStore } from 'src/stores/bridges'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import moment from 'moment'

const store = useBridgesStore()
const { locale } = useI18n()

const serverOffset = ref(0)

const now = moment()
if (now.utcOffset() !== 180) {
  now.utcOffset(180)
}
store.setTime(now)

window.addEventListener('appinstalled', () => {
  ym(66456622, 'reachGoal', 'appinstalled')
})

function getNow () {
  const n = moment()
  const now_with_offset = n.add(serverOffset.value, 'milliseconds')
  if (now_with_offset.utcOffset() !== 180) {
    now_with_offset.utcOffset(180)
  }
  store.setTime(now_with_offset)
}

function getYandexTime () {
  const domain = 'https://map-bridges-spb.ru'

  axios(domain + '/server_bridges/current_time.php')
    .then(response => {
      const response_time = response.data.time
      const moment_obj_response_time = moment(response_time)
      serverOffset.value = moment_obj_response_time.diff(moment())

      if (Object.prototype.hasOwnProperty.call(response.data, 'clocks')) {
        if (Object.prototype.hasOwnProperty.call(response.data.clocks, '2')) {
          store.setYandexClock(response.data.clocks['2'])
        }
      }
    })
    .catch(e => {
      console.log(e)
      ym(66456622, 'reachGoal', 'error_time')
    })
    .finally(() => {
      setInterval(getNow, 1000)
    })
}

getYandexTime()
</script>
