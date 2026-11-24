<template>
  <div class="aside_list fit flex column justify-between no-wrap">

    <q-list>
      <q-item-label header>{{ $t('language_string') }}</q-item-label>

      <q-item v-for="language in language_list"
              :key="language.id"
              :active="app_language === language.id"
              @click="setLanguage(language.id)"
              tag="label"
              v-ripple>

        <q-item-section avatar>
          <q-avatar class="position-relative">
            <img :src="language.src">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <span class="text">{{ language.label }}</span>
        </q-item-section>

      </q-item>

      <q-separator/>

      <q-item-label header>{{ $t('other') }}</q-item-label>

      <!-- dark_mode -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('dark_mode') }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle color="blue-grey" v-model="dark_mode"/>
        </q-item-section>
      </q-item>

      <!-- timing -->
      <q-item tag="label"
              @click="timing_mode_toggle()"
              v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('timing') }}</q-item-label>
          <q-item-label caption>{{ $t('timing_description') }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-icon name="update" color="blue-grey-7"/>
        </q-item-section>
      </q-item>

      <!-- write -->
      <q-item tag="label"
              @click="show_send_dialog()"
              v-ripple>
        <q-item-section>
          <span class="text">{{ $t('write') }}</span>
        </q-item-section>

        <q-item-section side>
          <q-icon name="send" color="blue-grey-7"/>
        </q-item-section>
      </q-item>

      <q-separator/>

      <!-- light status -->
      <q-item tag="label" @click="goToLensvet()">
        <q-item-section>
          <q-item-label>
            <span v-if="light_status.isLightOn" class="text-positive">{{ $t('light_on') }}</span>
            <span v-else class="text-warning">{{ $t('light_off') }}</span>
          </q-item-label>
          <q-item-label caption v-if="light_status.nextEventTime > 0">
            {{ formatNextEvent() }}
          </q-item-label>
        </q-item-section>
      </q-item>

    </q-list>


    <q-list>
      <q-item tag="label">
        <q-item-section>
          <q-item-label>man@bonusuber.ru</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>


    <q-dialog v-model="prompt">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('write_header') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
              v-model="contact"
              outlined
              autofocus
              :label="$t('write_contact')"
          />
        </q-card-section>

        <q-card-section>
          <q-input
              v-model="text"
              outlined
              type="textarea"
              :label="$t('write_letter')"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn
            flat
            no-caps
            :label="$t('cancel')"
            v-close-popup
          />
          <q-btn
              :loading="loading"
              no-caps
              color="primary"
              :label="$t('send')"
              @click="sendMessage()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBridgesStore } from 'src/stores/bridges'
import { useQuasar } from 'quasar'
import axios from 'axios'
import moment from 'moment'
import flag_ru from '../assets/icon_flag_ru.svg'
import flag_ch from '../assets/icon_flag_ch.svg'
import flag_en from '../assets/icon_flag_en.svg'

const store = useBridgesStore()
const $q = useQuasar()
const { t, locale } = useI18n()

const language_list = ref([
  { id: 'ch', label: 'Chinese', src: flag_ch },
  { id: 'ru', label: 'Русский', src: flag_ru },
  { id: 'en', label: 'English', src: flag_en }
])

const prompt = ref(false)
const text = ref('')
const contact = ref('')
const loading = ref(false)

const app_language = computed(() => locale.value)
const light_status = computed(() => store.light_status)
const dark_mode = computed({
  get: () => store.dark_mode,
  set: (value) => {
    ym(66456622, 'reachGoal', 'dark_mode')
    store.setDarkMode(value)
  }
})

onMounted(() => {
  // Component mounted
})

function setLanguage(lang) {
  localStorage.setItem('spb_bridges_language', lang)
  locale.value = lang
}

function show_send_dialog() {
  prompt.value = true
  ym(66456622, 'reachGoal', 'show_send_dialog')
}

function sendMessage() {
  ym(66456622, 'reachGoal', 'send_msg')

  if (contact.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Заполните поле с контактом' })
    return false
  }

  if (text.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Заполните поле текстом' })
    return false
  }

  const bodyFormData = new FormData()
  bodyFormData.set('contact', contact.value)
  bodyFormData.set('text', text.value)

  loading.value = true
  axios.post('https://map-bridges-spb.ru/api/send_msg.php', bodyFormData)
    .then((response) => {
      let type = ''
      if (response.data.includes('успешно')) {
        type = 'positive'
        text.value = ''
        contact.value = ''
        prompt.value = false
      } else if (response.data.includes('ошибки')) {
        type = 'negative'
      }
      $q.notify({ type: type, message: response.data })
    })
    .finally(() => {
      loading.value = false
    })
}

function timing_mode_toggle() {
  ym(66456622, 'reachGoal', 'timing_mode_toggle')
  if (store.timing_mode === null) {
    store.setTiming_mode(+new Date())
  } else {
    store.setTiming_mode(null)
  }
}

function formatNextEvent() {
  if (light_status.value.nextEventTime <= 0) {
    return ''
  }

  const times = store.Time
  if (!times || typeof times.unix !== 'function') {
    return ''
  }

  const currentTimestamp = times.unix()
  const timeDiff = light_status.value.nextEventTime - currentTimestamp

  if (timeDiff <= 0) {
    return ''
  }

  const hours = Math.floor(timeDiff / 3600)
  const minutes = Math.floor((timeDiff % 3600) / 60)

  const eventTime = moment.unix(light_status.value.nextEventTime).format('HH:mm')

  if (light_status.value.isLightOn) {
    return `${t('light_will_off')} ${t('through')} ${hours}ч ${minutes}м ${t('at')} ${eventTime}`
  } else {
    return `${t('light_will_on')} ${t('through')} ${hours}ч ${minutes}м ${t('at')} ${eventTime}`
  }
}

const goToLensvet = () => {
  window.open('https://lensvet.spb.ru/grafik_raboty_naruzhnogo_osvescheni/', 'blank')
}
</script>

<style lang="scss">
  .active_q_item {
    background-color: $primary;
  }

  .custom_ticket_write_avatar {
    background-color: #e1e1e1;

    .img_wrap {
      width: 100%;

      &.img_wrap__ticket {
        padding: 7px;
      }

      &.img_wrap__write {
        padding: 10px;
      }

      img {
        opacity: 0.6;
      }
    }
  }
</style>
