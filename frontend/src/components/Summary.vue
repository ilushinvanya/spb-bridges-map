<template>
  <q-card
    v-if="visible"
    class="summary-card"
    flat bordered
  >
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

    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">{{ $t('info') }}</div>
    </q-card-section>

    <q-card-section>
      <div class="text-body1" v-html="message"></div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useBridgesStore } from 'src/stores/bridges'
import { useI18n } from 'vue-i18n'
import moment from 'moment'

const ANIMATION_DURATION_MS = 400

const store = useBridgesStore()
const { t } = useI18n()

const visible = ref(true)

function getBridgeWord(count: number, locale: string): string {
  if (locale !== 'ru') {
    return count === 1 ? t('bridge_word_1') : t('bridge_word_2')
  }

  const cases = [2, 0, 1, 1, 1, 2]
  const word = count % 100 > 4 && count % 100 < 20
    ? t('bridge_word_5')
    : [t('bridge_word_1'), t('bridge_word_2'), t('bridge_word_5')][(count % 10 < 5) ? cases[count % 10] : cases[5]]

  return word
}

const computeSummary = computed(() => {
  const bridges = store.bridges_with_params
  if (!bridges || bridges.length === 0) return ''

  const currentTime = moment(store.Time)

  const openedBridges = bridges.filter(b => b.status === 2 || b.status === 3)
  const closedBridges = bridges.filter(b => b.status === 0 || b.status === 1)
  const notTodayBridges = bridges.filter(b => b.status === 4)

  let latestEndTime: moment.Moment | null = null
  let earliestStartTime: moment.Moment | null = null

  bridges.forEach(bridge => {
    const timeArray = bridge.timestamp && bridge.timestamp.length > 0 ? bridge.timestamp : bridge.time
    timeArray.forEach(timeObj => {
      if (timeObj.start === 0) return

      if (timeObj.start) {
        const startTimeStr = typeof timeObj.start === 'number'
          ? moment(timeObj.start > 9999999999 ? timeObj.start : timeObj.start * 1000).format('HH:mm')
          : timeObj.start as string
        const matchStart = /([0-9]*):([0-9]*)/.exec(startTimeStr)
        if (matchStart) {
          const startTime = currentTime.clone().hour(parseInt(matchStart[1])).minute(parseInt(matchStart[2]))
          if (!earliestStartTime || startTime.isBefore(earliestStartTime)) {
            earliestStartTime = startTime
          }
        }
      }

      if (timeObj.end) {
        const endTimeStr = typeof timeObj.end === 'number'
          ? moment(timeObj.end > 9999999999 ? timeObj.end : timeObj.end * 1000).format('HH:mm')
          : timeObj.end as string
        const matchEnd = /([0-9]*):([0-9]*)/.exec(endTimeStr)
        if (matchEnd) {
          const endTime = currentTime.clone().hour(parseInt(matchEnd[1])).minute(parseInt(matchEnd[2]))
          if (!latestEndTime || endTime.isAfter(latestEndTime)) {
            latestEndTime = endTime
          }
        }
      }
    })
  })

  const parseTime = store.parse_time
  let isDataFresh = false
  if (parseTime) {
    const parseDate = moment(parseTime)
    const today = currentTime.clone().startOf('day')
    isDataFresh = parseDate.isSameOrAfter(today)
  }

  const currentHour = currentTime.hour()

  if (latestEndTime && currentTime.isAfter(latestEndTime) && currentHour < 9) {
    return t('summary_all_closed')
  } else if (currentHour >= 9 && !isDataFresh) {
    return t('summary_no_data')
  } else if (openedBridges.length > 0) {
    const openedWord = getBridgeWord(openedBridges.length, store.app_language)
    const closedWord = getBridgeWord(closedBridges.length, store.app_language)
    return t('summary_in_progress', {
      opened: openedBridges.length,
      opened_word: openedWord,
      closed: closedBridges.length,
      closed_word: closedWord,
      not_today: notTodayBridges.length,
    })
  } else if (earliestStartTime && currentTime.isBefore(earliestStartTime)) {
    return t('summary_all_open')
  } else {
    return t('summary_all_open')
  }
})

const message = computeSummary

function close() {
  visible.value = false
}
</script>

<style lang="scss">
  .summary-card {
    width: 100%;
    position: relative;
    margin: 0 auto 10px;

    & * {
      user-select: none;
    }
  }
</style>
