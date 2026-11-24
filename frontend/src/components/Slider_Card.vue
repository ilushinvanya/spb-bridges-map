<template>
  <q-card
    class="slider_card"
    flat bordered
    :style="{ 'bottom': offset + 'px' }">
    <q-card-section>

      <q-btn
        dense
        unelevated
        round
        color="blue-grey-5"
        icon="clear"
        style="top:-10px; right:-10px"
        class="absolute-top-right z-max"
        @click="close()"
      />

      <q-slider
        v-model="sliderValue"
        :min="sliderMin"
        :max="sliderMax"
        :step="SLIDER_STEP"
        label
        label-always
        :label-value="sliderLabelValue"
        color="green"
      />

    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useBridgesStore } from 'src/stores/bridges'
import moment from 'moment'

const SLIDER_MIN_HOUR = 1
const SLIDER_MAX_HOUR = 6
const SLIDER_STEP = 60

const store = useBridgesStore()

const sliderValue = ref<number | null>(null)
const offset = ref(0)

const sliderMin = computed(() => {
  return +moment().hour(SLIDER_MIN_HOUR).minute(0)
})

const sliderMax = computed(() => {
  return +moment().hour(SLIDER_MAX_HOUR).minute(0)
})

const yandexClock = computed(() => store.yandex_clock)

const sunriseSunsetData = computed(() => {
  const clock = yandexClock.value
  if (!clock?.showSunriseSunset || !clock.sunset || !clock.sunrise) {
    return null
  }
  return { sunset: clock.sunset, sunrise: clock.sunrise }
})

const sliderLabelValue = computed(() => {
  if (sliderValue.value === null) {
    return '0'
  }

  const timeFormat = moment(sliderValue.value).format('HH:mm')
  let label = timeFormat

  if (sunriseSunsetData.value) {
    if (timeFormat === sunriseSunsetData.value.sunset) {
      label += ' 🌇'
    }
    if (timeFormat === sunriseSunsetData.value.sunrise) {
      label += ' 🌅'
    }
  }

  return label
})

function close() {
  store.setTiming_mode(null)
}

watch(sliderValue, (newVal) => {
  if (newVal !== null) {
    store.setTiming_mode(newVal)
  }
})

onMounted(() => {
  const timingMode = store.timing_mode
  if (timingMode && moment(timingMode).isBetween(sliderMin.value, sliderMax.value, undefined, '[)')) {
    sliderValue.value = timingMode
  } else {
    const now = new Date()
    now.setHours(SLIDER_MIN_HOUR)
    now.setMinutes(0)
    sliderValue.value = Date.parse(now.toString())
  }
})
</script>

<style lang="scss">
  .slider_card {
    width: 100%;
    position: relative;
    margin: 0 auto 10px;
    z-index: 1001;
  }
</style>
