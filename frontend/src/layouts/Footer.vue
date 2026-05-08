<template>
  <q-footer elevated class="bg-blue-grey-8 text-white">
    <q-toolbar>

      <q-avatar size="50px">
        <div class="hero-circle">
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

      <span>
        <div>
            <span v-if="time_check">{{ $t('time_footer') }} - </span>
            <span>{{ Time.format("HH:mm:ss") }}</span>
        </div>
        <div>
          <div class="weather"
               v-if="time_check">
            <span>{{ $t('temperature') }} {{ weather.temp }}°</span>
          </div>
        </div>
      </span>

    </q-toolbar>
  </q-footer>
</template>

<script>
import { useBridgesStore } from 'src/stores/bridges'

export default {
  name: 'FooterComponent',
  setup () {
    const store = useBridgesStore()
    return { store }
  },
  data () {
    return {
    }
  },
  computed: {
    yandex_clock () {
      return this.store.yandex_clock
    },
    weather () {
      if (Object.prototype.hasOwnProperty.call(this.yandex_clock, 'weather')) {
        return this.yandex_clock.weather
      } else {
        return false
      }
    },
    time_check () {
      return Object.prototype.hasOwnProperty.call(this.yandex_clock, 'offsetString')
    },
    Time () {
      return this.store.Time
    },
    updateClock () {
      var now = this.Time,
        second = now.seconds() * 6,
        minute = now.minutes() * 6 + second / 60,
        hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12

      return {
        hour_css: { 'transform': 'rotate(' + hour + 'deg)' },
        minute_css: { 'transform': 'rotate(' + minute + 'deg)' },
        second_css: { 'transform': 'rotate(' + second + 'deg)' }
      }
    },
  }
}
</script>

<style lang="scss">
  .weather {
    display: flex;
    align-items: center;
    img {
      width: 20px;
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
