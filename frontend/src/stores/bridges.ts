import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Moment } from 'moment'
import moment from 'moment'
import axios from 'axios'
import { Notify, useQuasar } from 'quasar'
import { i18n } from 'src/boot/i18n.ts'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YandexClock {
  offsetString?: string
  weather?: { temp: number; icon: string }
  showSunriseSunset?: boolean
  sunset?: string
  sunrise?: string
  [key: string]: unknown
}

export interface BridgeTitle {
  ru: string
  en: string
  ch: string
}

export interface BridgeTime {
  start: string | number
  end?: string
}

export interface Bridge {
  id: number
  link: string
  title: BridgeTitle
  time: BridgeTime[]
  timestamp?: BridgeTime[]
  coordinates: [number, number]
  images: { open: string; close: string }
  time_html?: string
  description?: string
  comment?: string
  marker_color?: string
  marker_symbol?: string
  status?: number
  url?: string
  [key: string]: unknown
}

interface CheckTimeResult {
  status: number  // 0: open, 1: will close, 2: close, 3: will open, 4: not opening today
  time_obj: BridgeTime | Record<string, never>
  comment: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_REGEX = /([0-9]*):([0-9]*)/
const WARNING_THRESHOLD_MINUTES = 20
const COLOR_BASE = { r: 63, g: 216, b: 32 }
const COLOR_CLOSE = '#ff5b50'
const COLOR_NOT_OPENING = '#808080'  // grey for bridges not opening today

// ─── Helpers (pure, no store dependency) ──────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function checkTime_color(checkTime_obj: CheckTimeResult): string {
  const { r, g, b } = COLOR_BASE
  let minutes = 0

  if (checkTime_obj.comment.length > 0) {
    const nums = checkTime_obj.comment.match(/[0-9]+/g)
    if (nums !== null) minutes = parseInt(nums.join(''))
  }

  switch (checkTime_obj.status) {
    case 0:
      return rgbToHex(r, g, b)
    case 1:
      if (minutes > 10) {
        const new_R = Math.min(255, r + 19 * (WARNING_THRESHOLD_MINUTES - minutes))
        return rgbToHex(new_R, g, b)
      } else {
        const new_G = Math.max(91, g - 15 * (10 - minutes))
        return rgbToHex(255, new_G, b)
      }
    case 2:
      return COLOR_CLOSE
    case 3:
      if (minutes > 10) {
        const new_G = Math.min(255, 91 + 15 * (WARNING_THRESHOLD_MINUTES - minutes))
        return rgbToHex(255, new_G, b)
      } else {
        const new_R = Math.min(255, 255 - 19 * (10 - minutes))
        return rgbToHex(new_R, g, b)
      }
    case 4:
      return COLOR_NOT_OPENING
    default:
      return rgbToHex(r, g, b)
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBridgesStore = defineStore('bridges', () => {
  const t = i18n.global.t
  const $q = useQuasar()

  // State
  const gl_support       = ref<boolean | null>(null)
  const Time             = ref<Moment | number>(0)
  const timing_mode      = ref<number | null>(null)
  const yandex_clock     = ref<YandexClock>({})
  const open_bridge_id   = ref<number>(0)
  const source_bridges   = ref<Bridge[]>([])   // raw API data, persisted as cache
  const dark_mode        = ref<boolean>(false)
  const parse_time       = ref<string | null>(null)
  const show_hint        = ref<boolean>(true)
  const map_init_counter = ref<number>(0)       // increments after getBridges → triggers map init

  // Cache for bridges_with_params optimization
  const lastCheckMinute = ref<number>(-1)
  const cachedBridges = ref<Bridge[]>([])

  // ── Computed: mobile check ──────────────────────────────────────────────────

  const mobilecheck = computed<boolean>(() => $q.platform.is.mobile)

  // ── Locale (reactive, from i18n) ────────────────────────────────────────────

  const app_language = computed<string>(() => i18n.global.locale.value as string)

  // ── Time helper ─────────────────────────────────────────────────────────────

  function getMomentNowTime(): Moment {
    if (timing_mode.value !== null) {
      return moment(timing_mode.value)
    }
    return moment(Time.value as number)
  }

  // ── Format time helper ──────────────────────────────────────────────────────
  // Конвертирует timestamp (если это число) в формат "HH:mm"
  function formatTimeValue(value: string | number): string {
    if (typeof value === 'number') {
      // Если это timestamp (Unix время в секундах или миллисекундах)
      const timestamp = value > 9999999999 ? value : value * 1000
      return moment(timestamp).format('HH:mm')
    }
    // Если это уже строка, возвращаем как есть
    return value as string
  }

  // ── checkTime ───────────────────────────────────────────────────────────────

  function checkTime(time_array: BridgeTime[], use_timestamp?: boolean): CheckTimeResult {
    // Если массив времени пуст или содержит только {start: 0}, мост сегодня не разводится
    if (time_array.length === 0 || (time_array.length === 1 && time_array[0].start === 0)) {
      return { status: 4, time_obj: {}, comment: t('not_opening_today') }
    }

    let result: CheckTimeResult = { status: 0, time_obj: {}, comment: t('open') }
    const now = getMomentNowTime()

    for (const time_obj of time_array) {
      const obj: Record<string, Moment | number | string> = { start: '', end: '' }

      for (const [key, value] of Object.entries(time_obj)) {
        if (value === 0) {
          obj['start'] = 0
          break
        }
        // Форматируем значение если это timestamp
        const formattedValue = formatTimeValue(value as string | number)
        const match = TIME_REGEX.exec(formattedValue)
        if (!match) continue
        obj[key] = now.clone().hour(parseInt(match[1])).minute(parseInt(match[2]))
      }

      if (obj['start'] === 0) break

      const start = obj.start as Moment
      const end = obj.end as Moment

      if (now.isBetween(start, end, undefined, '[)')) {
        result.status = 2
        result.time_obj = time_obj
        result.comment = t('close')

        const to_end = now.diff(end, 'minutes')
        if (to_end >= -WARNING_THRESHOLD_MINUTES && to_end <= 0) {
          result.status = 3
          result.time_obj = time_obj
          result.comment = t('will_open_min', { minutes: Math.abs(to_end) })
        }
        break
      } else {
        const to_start = now.diff(start, 'minutes')
        if (Math.abs(to_start) <= WARNING_THRESHOLD_MINUTES) {
          result.status = 1
          result.time_obj = time_obj
          result.comment = t('will_close_min', { minutes: Math.abs(to_start) })
          break
        }
      }
    }

    return result
  }

  // ── bridges_with_params (computed from source_bridges + reactive state) ─────

  const bridges_with_params = computed<Bridge[]>(() => {
    const currentMinute = getMomentNowTime().minute()

    // Мемоизация: пересчёт только при изменении минуты
    if (currentMinute === lastCheckMinute.value && cachedBridges.value.length > 0) {
      return cachedBridges.value
    }

    lastCheckMinute.value = currentMinute

    const result = source_bridges.value.map((bridge, index) => {
      // Используем timestamp если доступен, иначе используем time
      const timeArray = bridge.timestamp && bridge.timestamp.length > 0 ? bridge.timestamp : bridge.time
      const checkTime_obj = checkTime(timeArray)
      const result_obj: Bridge = Object.assign({}, bridge)
      result_obj['id'] = index + 1

      let bridge_description = timeArray.map((time_obj) => {
        let string_time = ''
        if (Object.prototype.hasOwnProperty.call(time_obj, 'start')) {
          if (time_obj.start === 0) {
            string_time = t('not_closed')
          } else {
            // Форматируем время для отображения
            string_time += formatTimeValue(time_obj.start)
          }
        } else {
          return false
        }
        if (Object.prototype.hasOwnProperty.call(time_obj, 'end')) {
          string_time += ' - ' + formatTimeValue(time_obj.end!)
        }
        if (JSON.stringify(time_obj) === JSON.stringify(checkTime_obj.time_obj)) {
          string_time = '<b>' + string_time + '</b>'
        }
        return string_time
      }).filter(Boolean).join('<br>')

      result_obj.time_html = bridge_description

      if (bridge_description.length > 0) bridge_description += '<br><br>'

      const lang_prefix = app_language.value !== 'ru' ? app_language.value + '.' : ''
      const link = 'https://' + lang_prefix + 'mostotrest-spb.ru/bridges/' + bridge.link
      bridge_description += "<a href='" + link + "' target='_blank'>" + t('mostotrest') + '</a>'
      result_obj.url = link
      result_obj.description = bridge_description
      result_obj.comment = checkTime_obj.comment
      result_obj.marker_color = checkTime_color(checkTime_obj)
      result_obj.status = checkTime_obj.status
      result_obj.marker_symbol = [2, 3].includes(checkTime_obj.status)
        ? (gl_support.value ? 'boat' : 'ferry')
        : 'car'

      return result_obj
    })

    cachedBridges.value = result
    return result
  })

  // ── geoJson_features (computed from bridges_with_params) ───────────────────

  const geoJson_features = computed(() => {
    const features = bridges_with_params.value.map(bridge => {
      const poster_image = (bridge.status === 0 || bridge.status === 1 || bridge.status === 4)
        ? bridge.images.open
        : bridge.images.close

      let custom_status = { color: '', text: '' }
      if (bridge.status === 0)      custom_status = { color: 'light-green', text: '&nbsp;' }
      else if (bridge.status === 1) custom_status = { color: 'light-green', text: t('open') }
      else if (bridge.status === 2) custom_status = { color: 'red', text: '&nbsp;' }
      else if (bridge.status === 3) custom_status = { color: 'red', text: t('close') }
      else if (bridge.status === 4) custom_status = { color: 'grey', text: t('not_opening_today') }

      // Используем timestamp если доступен, иначе time
      const timeArray = bridge.timestamp && bridge.timestamp.length > 0 ? bridge.timestamp : bridge.time

      return {
        id: bridge.id,
        type: 'Feature',
        geometry: { type: 'Point', coordinates: bridge.coordinates },
        properties: {
          custom_active_color:       bridge.id === open_bridge_id.value ? 'yellow' : 'white',
          custom_active_stroke_size: bridge.id === open_bridge_id.value ? 3 : 1,
          custom_status_color:       custom_status.color,
          custom_status_text:        custom_status.text,
          poster_image,
          custom_comment:            bridge.comment,
          custom_time_html:          bridge.time_html,
          custom_url:                bridge.url,
          original_time:             timeArray,
          title:                     bridge.title[app_language.value as keyof BridgeTitle],
          description:               "<div class='bridge_comment'>" + bridge.comment + '</div><div>' + bridge.description + '</div>',
          'marker-color':            bridge.marker_color,
          'marker-symbol':           bridge.marker_symbol,
          'marker-size':             'large',
        },
      }
    })
    return { type: 'FeatureCollection', features }
  })

  // ── getBridges ──────────────────────────────────────────────────────────────

  async function getBridges(): Promise<void> {
    const domain = import.meta.env.VITE_API_DOMAIN || 'https://map-bridges-spb.ru'

    try {
      const response = await axios(domain + '/api/get_bridges.php')
      if (typeof response.data === 'object' &&
          Object.prototype.hasOwnProperty.call(response.data, 'bridges')) {
        const prev = JSON.stringify(source_bridges.value)
        source_bridges.value = response.data.bridges
        parse_time.value = response.data.parse_time

        if (JSON.stringify(source_bridges.value) !== prev && prev !== '[]') {
          Notify.create({ type: 'positive', message: 'Расписание обновлено' })
        }
      }
    } catch (error) {
      Notify.create({ type: 'negative', message: t('load_error') })
      const ymId = import.meta.env.VITE_YM_ID || '66456622'
      ym(parseInt(ymId), 'reachGoal', 'load_error')
    } finally {
      map_init_counter.value++
    }
  }

  // ── Simple setters ──────────────────────────────────────────────────────────

  const setDarkMode = (bool: boolean)             => { dark_mode.value = bool }
  const setOpen_bridge = (id: number)             => { open_bridge_id.value = id }
  const setGLSupport = (bool: boolean)            => { gl_support.value = bool }
  const setTime = (payload: Moment | number)      => { Time.value = payload }
  const setTiming_mode = (payload: number | null) => { timing_mode.value = payload }
  const setYandexClock = (payload: YandexClock)   => { yandex_clock.value = payload }
  const setParseTime = (v: string | null)         => { parse_time.value = v }
  const setShowHint = (bool: boolean)             => { show_hint.value = bool }

  return {
    // state
    gl_support, Time, timing_mode, yandex_clock,
    open_bridge_id, source_bridges, bridges_with_params,
    geoJson_features, dark_mode, parse_time, show_hint,
    map_init_counter,
    // computed
    mobilecheck, app_language,
    // actions
    getBridges,
    setDarkMode, setOpen_bridge, setGLSupport,
    setTime, setTiming_mode, setYandexClock, setParseTime, setShowHint,
  }
})
