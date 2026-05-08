import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Moment } from 'moment'
import moment from 'moment'
import axios from 'axios'
import { Notify } from 'quasar'
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
  status: number
  time_obj: BridgeTime | Record<string, never>
  comment: string
}

// ─── Helpers (pure, no store dependency) ──────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function checkTime_color(checkTime_obj: CheckTimeResult): string {
  let R = 63, G = 216
  const B = 32
  let result = ''
  let minutes = 0

  if (checkTime_obj.comment.length > 0) {
    const nums = checkTime_obj.comment.match(/[0-9]+/g)
    if (nums !== null) minutes = parseInt(nums.join(''))
  }

  switch (checkTime_obj.status) {
    case 0: return rgbToHex(R, G, B)
    case 1:
      if (minutes > 10) {
        let new_R = R + 19 * (20 - minutes)
        if (new_R > 255) new_R = 255
        result = rgbToHex(new_R, G, B)
      } else {
        let new_G = G - 15 * (10 - minutes)
        if (new_G < 91) new_G = 91
        result = rgbToHex(255, new_G, B)
      }
      return result
    case 2: return '#ff5b50'
    case 3:
      if (minutes > 10) {
        let new_G = 91 + 15 * (20 - minutes)
        if (new_G > 255) new_G = 255
        result = rgbToHex(255, new_G, B)
      } else {
        let new_R = 255 - 19 * (10 - minutes)
        if (new_R > 255) new_R = 255
        result = rgbToHex(new_R, G, B)
      }
      return result
    default: return rgbToHex(R, G, B)
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBridgesStore = defineStore('bridges', () => {
  const t = i18n.global.t

  // State
  const gl_support       = ref<boolean | null>(null)
  const Time             = ref<Moment | number>(0)
  const timing_mode      = ref<number | null>(null)
  const yandex_clock     = ref<YandexClock>({})
  const open_bridge_id   = ref<number>(0)
  const source_bridges   = ref<Bridge[]>([])   // raw API data, persisted as cache
  const geoJson_features = ref<object>({})
  const dark_mode        = ref<boolean>(false)
  const parse_time       = ref<string | null>(null)
  const show_hint        = ref<boolean>(true)
  const map_init_counter = ref<number>(0)       // increments after getBridges → triggers map init

  // ── Computed: mobile check ──────────────────────────────────────────────────

  const mobilecheck = computed<boolean>(() => {
    let check = false
    ;(function (a: string) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substring(0, 4))) check = true
    })(navigator.userAgent || navigator.vendor)
    return check
  })

  // ── Locale (reactive, from i18n) ────────────────────────────────────────────

  const app_language = computed<string>(() => i18n.global.locale.value as string)

  // ── Time helper ─────────────────────────────────────────────────────────────

  function getMomentNowTime(): Moment {
    if (timing_mode.value !== null) {
      return moment(timing_mode.value)
    }
    return moment(Time.value as number)
  }

  // ── checkTime ───────────────────────────────────────────────────────────────

  function checkTime(time_array: BridgeTime[]): CheckTimeResult {
    let result: CheckTimeResult = { status: 0, time_obj: {}, comment: t('open') }

    time_array.every((time_obj) => {
      const obj: Record<string, Moment | number | string> = { start: '', end: '' }

      for (const [key, value] of Object.entries(time_obj)) {
        if (value === 0) {
          obj['start'] = 0
          return false
        }
        const regex = /([0-9]*):([0-9]*)/g
        const match = regex.exec(value as string)
        if (!match) return true
        obj[key] = getMomentNowTime().hour(parseInt(match[1])).minute(parseInt(match[2]))
      }

      const start = obj.start as Moment
      const end = obj.end as Moment

      if (getMomentNowTime().isBetween(start, end, undefined, '[)')) {
        result.status = 2
        result.time_obj = time_obj
        result.comment = t('close')

        const to_end = getMomentNowTime().diff(end, 'minutes')
        if (to_end >= -20 && to_end <= 0) {
          result.status = 3
          result.time_obj = time_obj
          result.comment = t('will_open_min', { minutes: Math.abs(to_end) })
          return false
        }
        return false
      } else {
        const to_start = getMomentNowTime().diff(start, 'minutes')
        if (Math.abs(to_start) <= 20) {
          result.status = 1
          result.time_obj = time_obj
          result.comment = t('will_close_min', { minutes: Math.abs(to_start) })
          return false
        }
        return true
      }
    })

    return result
  }

  // ── bridges_with_params (computed from source_bridges + reactive state) ─────

  const bridges_with_params = computed<Bridge[]>(() => {
    return source_bridges.value.map((bridge, index) => {
      const checkTime_obj = checkTime(bridge.time)
      const result_obj: Bridge = Object.assign({}, bridge)
      result_obj['id'] = index + 1

      let bridge_description = bridge.time.map((time_obj) => {
        let string_time = ''
        if (Object.prototype.hasOwnProperty.call(time_obj, 'start')) {
          if (time_obj.start === 0) {
            string_time = t('not_closed')
          } else {
            string_time += time_obj.start
          }
        } else {
          return false
        }
        if (Object.prototype.hasOwnProperty.call(time_obj, 'end')) {
          string_time += ' - ' + time_obj.end
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
  })

  // ── geoJson_features (computed from bridges_with_params) ───────────────────

  const geoJson_features_computed = computed(() => {
    const features = bridges_with_params.value.map(bridge => {
      const poster_image = (bridge.status === 0 || bridge.status === 1)
        ? bridge.images.open
        : bridge.images.close

      let custom_status = { color: '', text: '' }
      if (bridge.status === 0)      custom_status = { color: 'light-green', text: '&nbsp;' }
      else if (bridge.status === 1) custom_status = { color: 'light-green', text: t('open') }
      else if (bridge.status === 2) custom_status = { color: 'red', text: '&nbsp;' }
      else if (bridge.status === 3) custom_status = { color: 'red', text: t('close') }

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
          original_time:             bridge.time,
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

  // Keep geoJson_features (used by Map.vue) in sync with computed
  watch(geoJson_features_computed, (val) => {
    geoJson_features.value = val
  }, { deep: true })

  // ── getBridges ──────────────────────────────────────────────────────────────

  async function getBridges(): Promise<void> {
    const domain = 'https://map-bridges-spb.ru'

    try {
      const response = await axios(domain + '/server_bridges/get_bridges.php')
      if (typeof response.data === 'object' &&
          Object.prototype.hasOwnProperty.call(response.data, 'bridges')) {
        const prev = JSON.stringify(source_bridges.value)
        source_bridges.value = response.data.bridges
        parse_time.value = response.data.parse_time

        if (JSON.stringify(source_bridges.value) !== prev && prev !== '[]') {
          Notify.create({ type: 'positive', message: 'Расписание обновлено' })
        }
      }
    } catch {
      Notify.create({ type: 'negative', message: t('load_error') })
      ym(66456622, 'reachGoal', 'load_error')
    } finally {
      geoJson_features.value = geoJson_features_computed.value
      console.log(map_init_counter.value)
      map_init_counter.value++
    }
  }

  // ── Simple setters ──────────────────────────────────────────────────────────

  const setDarkMode    = (bool: boolean)           => { dark_mode.value    = bool }
  const setFeatures    = (obj: object)             => { geoJson_features.value = obj }
  const setOpen_bridge = (id: number)              => { open_bridge_id.value = id }
  const setGLSupport   = (bool: boolean)           => { gl_support.value   = bool }
  const setTime        = (payload: Moment | number)=> { Time.value         = payload }
  const setTiming_mode = (payload: number | null)  => { timing_mode.value  = payload }
  const setYandexClock = (payload: YandexClock)    => { yandex_clock.value = payload }
  const setParseTime   = (v: string | null)        => { parse_time.value   = v }
  const setShowHint    = (bool: boolean)           => { show_hint.value    = bool }

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
    setDarkMode, setFeatures, setOpen_bridge, setGLSupport,
    setTime, setTiming_mode, setYandexClock, setParseTime, setShowHint,
  }
})
