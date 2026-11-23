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
          <q-avatar size="30px" :style="{backgroundColor: bridge.marker_color}"/>
        </q-item-section>

        <q-item-section>
          <q-item-label><div>{{ bridge.title[app_language] }}</div></q-item-label>
          <q-item-label caption>{{ bridge.comment }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-item-label caption>
            <div class="text-right"
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
import { computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { useI18n } from 'vue-i18n'
import { useBridgesStore } from 'src/stores/bridges'

const store = useBridgesStore()
const { locale: app_language, t } = useI18n()

const bridges_with_params = computed(() => store.bridges_with_params)
const open_bridge_id = computed(() => store.open_bridge_id)
const parseTime = computed(() => {
  if (store.parse_time) {
    const currentDate = new Date(store.parse_time)
    return format(currentDate, 'dd.MM.yyyy // HH:mm')
  }
  return ''
})

onMounted(() => {
  // Component mounted
})

function handleClickBridge(bridge) {
  if (store.gl_support) {
    store.setOpen_bridge(bridge.id)
  } else {
    window.bridges_map_layer.eachLayer((layer) => {
      if (bridge.title[app_language.value] === layer.feature.properties.title) {
        layer.openPopup()
      }
    })
  }

  ym(66456622, 'reachGoal', 'list_' + bridge.link)

  const coords = bridge.coordinates
  if (store.gl_support) {
    // Для Mapbox GL используем panTo с [lng, lat]
    window.map.panTo([coords[0] + 0.003, coords[1] - 0.004])
  } else {
    // Для Leaflet используем L.latLng с [lat, lng]
    window.map.panTo(L.latLng(coords[1] - 0.004, coords[0] + 0.003))
  }
}
</script>
