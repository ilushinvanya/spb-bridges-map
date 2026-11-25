<template>
  <q-card
    v-touch-pan.vertical.prevent.mouse="handleSwipe"
    class="bridge-card relative-position"
    :class="{ hide_to_bottom: hideToBottom }"
    :style="{ 'bottom': offset + 'px' }"
    flat bordered
  >
    <q-btn
      dense
      unelevated
      round
      color="blue-grey-5"
      icon="clear"
      style="top:-10px; right:-10px; z-index: 9"
      class="absolute-top-right"
      @click="openBridgeId = 0"
    />

    <q-slide-transition>
      <div v-show="!collapse">
        <q-img
          class="responsive"
          :src="openBridgeObj.poster_image"/>
      </div>
    </q-slide-transition>

    <q-card-section @click="collapse = !collapse">
      <div class="touch-stick"></div>
      <div class="text-h6 ellipsis">
        {{ openBridgeObj.title }}
        <q-badge
          v-if="!camera"
          align="top"
          :color="openBridgeObj.custom_status_color"
          v-html="openBridgeObj.custom_status_text"></q-badge>
      </div>
      <div v-if="!camera"
           class="text-body2">
        {{ openBridgeObj.custom_comment }}
      </div>
    </q-card-section>

    <q-separator v-if="commentString"/>
    <q-card-section v-if="commentString">
      <div v-html="commentString"></div>
    </q-card-section>

    <q-separator/>

    <q-card-section v-if="!camera">
      <div style="margin-left: -4px">
        <q-chip
          v-for="(time, index) in timesChip"
          :key="index"
          :style="{ backgroundColor: time.includes('<b>') ? openBridgeObj['marker-color'] : '' }"
          :text-color="time.includes('<b>') ? 'white' : ''"
          icon="schedule"
        >
          <div v-html="time"></div>
        </q-chip>
      </div>
    </q-card-section>

    <q-separator/>

    <q-slide-transition>
      <q-card-actions
        v-if="!camera"
        class="q-pa-none"
        v-show="!collapse">
        <div class="q-pa-md">
          <q-btn
            outline
            no-caps
            icon="link"
            color="primary"
            type="a"
            target="_blank"
            :href="openBridgeObj.custom_url"
            :label="$t('mostotrest')"
          />
        </div>
      </q-card-actions>
    </q-slide-transition>

  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBridgesStore } from 'src/stores/bridges'
import { useI18n } from 'vue-i18n'
import moment from 'moment'

const SWIPE_CLOSE_THRESHOLD = -100
const ANIMATION_DURATION_MS = 400

const store = useBridgesStore()
const { t } = useI18n()

// Форматирует время: если число (timestamp) - конвертирует в HH:mm, иначе возвращает как есть
function formatTime(value: string | number): string {
  if (typeof value === 'number') {
    const timestamp = value > 9999999999 ? value : value * 1000
    return moment(timestamp).format('HH:mm')
  }
  return value as string
}

const offset = ref(0)
const collapse = ref(true)
const hideToBottom = ref(true)
const isFinalAfterCollapse = ref(true)

const camera = computed(() => openBridgeId.value === 14)

const Features = computed(() => store.geoJson_features)

const openBridgeId = computed({
  get: () => store.open_bridge_id,
  set: (value: number) => store.setOpen_bridge(value)
})

const openBridgeObj = computed(() => {
  const feature = Features.value.features.find((f: any) => f.id === openBridgeId.value)
  return feature?.properties ?? {}
})

const timesChip = computed(() => {
  return openBridgeObj.value.custom_time_html?.split('<br>') ?? []
})

const commentString = computed(() => {
  const originalTime = openBridgeObj.value.original_time
  if (!originalTime || originalTime[0]?.start === 0) return ''

  const firstStart = formatTime(originalTime[0].start)
  const firstEnd = formatTime(originalTime[0].end)

  let resultString = t('first_string', { firstStart, firstEnd })
  if (originalTime.length === 2) {
    const secondStart = formatTime(originalTime[1].start)
    const secondEnd = formatTime(originalTime[1].end)
    resultString += '<br/>' + t('second_string', { secondStart, secondEnd })
  }
  return resultString
})

function handleSwipe({ evt, ...info }: any) {
  if (info.direction === 'up') {
    collapse.value = false
    isFinalAfterCollapse.value = false
  } else if (info.direction === 'down') {
    if (info.isFinal) {
      isFinalAfterCollapse.value = true
    }

    if (!collapse.value) {
      collapse.value = true
    }

    if (collapse.value && isFinalAfterCollapse.value) {
      offset.value -= info.delta.y
      if (info.isFinal) {
        if (offset.value < SWIPE_CLOSE_THRESHOLD) {
          hideToBottom.value = true
            openBridgeId.value = 0
          // setTimeout(() => {
          // }, ANIMATION_DURATION_MS)
        } else {
          offset.value = 0
        }
      }
    }
  }
}

onMounted(() => {
  if (camera.value) {
    collapse.value = false
  }
  hideToBottom.value = false
})
</script>

<style lang="scss">
  .height_300 {
    height: 300px;
  }
  .bridge-card {
    width: 100%;
    margin: 0 auto 10px;

    .touch-stick {
      background: #c7c7c7;
      position: absolute;
      width: 45px;
      height: 6px;
      top: 4px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 4px;
    }

    & * {
      user-select: none;
    }
  }
</style>
