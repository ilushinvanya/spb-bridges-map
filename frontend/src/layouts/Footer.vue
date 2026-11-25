<template>
  <q-footer bordered class="bg-blue-grey-8 text-white">
    <q-toolbar>

      <q-avatar size="50px">
        <div class="hero-circle" v-if="Time && typeof Time.seconds === 'function'">
          <div class="hero-face">
            <div id="hour"
                 class="hero-hour"
                 :style="updateClock.hour_css"
            ></div>

            <div id="minute"
                 class="hero-minute"
                 :style="updateClock.minute_css"
            ></div>

            <div id="second"
                 class="hero-second"
                 :style="updateClock.second_css"
            ></div>

          </div>
        </div>
      </q-avatar>
      <div>
        <div>
            <span v-if="time_check">{{ $t('time_footer') }} - </span>
            <span v-if="Time && typeof Time.format === 'function'">{{ Time.format("HH:mm:ss") }}</span>
        </div>
        <div class="second-row">
          <div class="weather"
               v-if="time_check && weather">
            <img v-if="weatherIconUrl"
                 :src="weatherIconUrl"
                 :alt="weather.icon"
                 class="weather-icon">
            <span>{{ $t('temperature') }} {{ weather.temp }}°</span>
          </div>
          <div class="sun-times" v-if="time_check && yandex_clock.sunrise">
            <span>🌅 {{ yandex_clock.sunrise }}</span>
            <span>🌇 {{ yandex_clock.sunset }}</span>
          </div>
        </div>
      </div>
    </q-toolbar>
  </q-footer>
</template>

<script setup>
import { computed } from 'vue'
import { useBridgesStore } from 'src/stores/bridges'

const store = useBridgesStore()

const yandex_clock = computed(() => store.yandex_clock)

const weather = computed(() => {
  if (Object.prototype.hasOwnProperty.call(yandex_clock.value, 'weather')) {
    return yandex_clock.value.weather
  } else {
    return false
  }
})

// Маппинг кодов иконок из API Яндекса (с тире) на коды для иконок (с подчеркиванием)
const apiIconToIconCode = {
  'skc-d': 'skc_d',
  'skc-n': 'skc_n',
  'fg-d': 'fg_d',
  'fg-n': 'fg_n',
  'bkn-d': 'bkn_d',
  'bkn-n': 'bkn_n',
  'bkn--ra-d': 'bkn_-ra_d',
  'bkn--ra-n': 'bkn_-ra_n',
  'bkn--sn-d': 'bkn_-sn_d',
  'bkn--sn-n': 'bkn_-sn_n',
  'bkn-ra-d': 'bkn_ra_d',
  'bkn-ra-n': 'bkn_ra_n',
  'bkn-sn-d': 'bkn_sn_d',
  'bkn-sn-n': 'bkn_sn_n',
  'bkn-+ra-d': 'bkn_+ra_d',
  'bkn-+ra-n': 'bkn_+ra_n',
  'bkn-+sn-d': 'bkn_+sn_d',
  'bkn-+sn-n': 'bkn_+sn_n',
  'ovc-ts': 'ovc_ts',
  'ovc-ts-ra': 'ovc_ts_ra',
  'ovc-ts-ha': 'ovc_ts_ha',
  'ovc': 'ovc',
  'ovc--ra': 'ovc_-ra',
  'ovc--sn': 'ovc_-sn',
  'ovc-ra': 'ovc_ra',
  'ovc-sn': 'ovc_sn',
  'ovc-+ra': 'ovc_+ra',
  'ovc-+sn': 'ovc_+sn',
  'ovc-ra-sn': 'ovc_ra_sn',
  'ovc-ha': 'ovc_ha',
  '-bl': '-bl',
  'bl': 'bl',
  'dst': 'dst',
  'du-st': 'du_st',
  'smog': 'smog',
  'strm': 'strm',
  'vlka': 'vlka'
}

const weatherIconUrl = computed(() => {
  if (weather.value && weather.value.icon) {
    // Преобразуем код из API (с тире) в код для иконок (с подчеркиванием)
    const iconCode = apiIconToIconCode[weather.value.icon]
    return `https://yastatic.net/weather/i/icons/funky/dark/${iconCode}.svg`
  }
  return ''
})

const time_check = computed(() => {
  return Object.prototype.hasOwnProperty.call(yandex_clock.value, 'offsetString')
})

const Time = computed(() => store.Time)

const updateClock = computed(() => {
  const now = Time.value
  const second = now.seconds() * 6
  const minute = now.minutes() * 6 + second / 60
  const hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12

  return {
    hour_css: { 'transform': `rotate(${hour}deg)` },
    minute_css: { 'transform': `rotate(${minute}deg)` },
    second_css: { 'transform': `rotate(${second}deg)` }
  }
})
</script>

<style lang="scss">
  .q-footer {
    text-shadow: 0 0 3px black;
  }

  .second-row {
    display: flex;
    flex-wrap: wrap;
  }

  .weather {
    display: flex;
    align-items: end;
    gap: 6px;
    margin-right: 20px;

    .weather-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
  }

  .sun-times {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
    font-size: 14px;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .hero-circle {
    width: 40px;
    height: 40px;
    position: relative;
    border: 1px solid #fff;
    border-radius: 50%;

    .hero-face {
      width: 100%;
      height: 100%;

      &:after {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        margin: -3px 0 0 -3px;
        background: #fff;
        border-radius: 6px;
        content: "";
        display: block
      }

      .hero-hour {
        width: 0;
        height: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        margin: -1px 0 -1px -25%;
        padding: 1px 0 1px 25%;
        background: #fff;
        -ms-transform-origin: 100% 50%;
        transform-origin: 100% 50%;
        border-radius: 4px 0 0 4px
      }

      .hero-minute {
        width: 0;
        height: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        margin: -35% -1px 0;
        padding: 35% 1px 0;
        background: #fff;
        -ms-transform-origin: 50% 100%;
        transform-origin: 50% 100%;
        border-radius: 3px 3px 0 0
      }

      .hero-second {
        width: 0;
        height: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        margin: -40% -1px 0 -1px;
        padding: 40% 1px 0;
        background: #fff;
        -ms-transform-origin: 50% 100%;
        transform-origin: 50% 100%
      }
    }
  }
</style>
