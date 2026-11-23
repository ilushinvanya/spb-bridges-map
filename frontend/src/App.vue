<template>
  <router-view />
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useBridgesStore } from 'src/stores/bridges'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import moment from 'moment'

const store = useBridgesStore()
const { locale } = useI18n()

const serverOffset = ref(0)
let intervalId = null

const ymId = parseInt(process.env.YM_ID || '66456622')
const apiDomain = process.env.API_DOMAIN || 'https://map-bridges-spb.ru'

const now = moment()
if (now.utcOffset() !== 180) {
  now.utcOffset(180)
}
store.setTime(now)

window.addEventListener('appinstalled', () => {
  ym(ymId, 'reachGoal', 'appinstalled')
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
  axios(apiDomain + '/api/current_time.php')
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
      ym(ymId, 'reachGoal', 'error_time')
    })
    .finally(() => {
      intervalId = setInterval(getNow, 1000)
    })
}

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

getYandexTime()
</script>
