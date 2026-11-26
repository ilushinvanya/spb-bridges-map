<template>
  <div class="q-pa-none">
    <q-list>
      <q-item v-for="bridge in bridges_with_params"
              @click="handleClickBridge(bridge)"
              :key="bridge.link"
              :active="bridge.id === open_bridge_id"
              active-class="bg-teal-3 text-grey-8"
              clickable
              v-ripple>
        <q-item-section avatar>
          <q-avatar size="30px" :style="{backgroundColor: bridge.marker_color}">
            <img
                v-if="bridge.marker_symbol"
                :src="`/map_icons/${bridge.marker_symbol}.png`"
                :alt="bridge.marker_symbol"
                class="bridge-icon-list"
            />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label><div>{{ bridge.title[app_language] }}</div></q-item-label>
          <q-item-label caption>{{ bridge.comment }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-item-label>
            <div class="text-right text-caption"
                 style="width:92px"
                 v-html="bridge.time_html"></div>
          </q-item-label>
        </q-item-section>

      </q-item>
      <q-separator spaced />
      <q-item-label header>{{ $t('last_update') }} - {{ parseTime }}</q-item-label>
      <q-item>
        <a
          href="https://mostotrest-spb.ru/razvodka-mostov"
          target="_blank"
          class="text-primary"
        >{{ $t('site_mostotrest') }}</a>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { useBridgesStore } from 'src/stores/bridges'
import { useYandexMetrika } from 'src/composables/useYandexMetrika'

const store = useBridgesStore()
const { locale: app_language, t } = useI18n()
const { reachGoal } = useYandexMetrika()

const bridges_with_params = computed(() => store.bridges_with_params)
const open_bridge_id = computed(() => store.open_bridge_id)
const parseTime = computed(() => {
  if (store.parse_time) {
    const currentDate = new Date(store.parse_time)
    return moment(currentDate).format('DD.MM.yyyy // HH:mm')
  }
  return ''
})

function handleClickBridge(bridge) {
  store.setOpen_bridge(bridge.id)
  reachGoal('list_' + bridge.link)
  const coords = bridge.coordinates
  // Для Leaflet используем L.latLng с [lat, lng]
  window.map.panTo(L.latLng(coords[1] - 0.004, coords[0] + 0.003))
}
</script>

<style scoped>
.bridge-icon-list {
  width: 16px !important;
  height: 16px !important;
}
</style>
