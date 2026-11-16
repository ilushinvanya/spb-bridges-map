<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import { computed, watch, shallowRef, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import mapboxgl from 'mapbox-gl'
import { useBridgesStore } from 'src/stores/bridges'

const store = useBridgesStore()
const $q = useQuasar()
const { t } = useI18n()


const mapbox_access_token = process.env.MAPBOX_TOKEN
const url_webcam = process.env.WEBCAM_URL

const map = shallowRef<any>(null)
const bridges_map_layer = shallowRef<any>(null)

const dark_mode = computed(() => store.dark_mode)
const Features = computed(() => store.geoJson_features)

const map_styles = computed(() =>
  dark_mode.value
    ? 'mapbox://styles/mapbox/dark-v10'
    : 'mapbox://styles/mapbox/streets-v11'
)

function checkSupportGLBrowser () {
  mapboxgl.accessToken = mapbox_access_token
  if (!mapboxgl.supported()) {
    initMapboxJSMap()
    store.setGLSupport(false)
    console.log('Your browser does not support Mapbox GL')
    ym(66456622, 'reachGoal', 'gl_not_supported')
  } else {
    store.setGLSupport(true)
    initMapboxGLMap()
  }
  $q.dark.set(dark_mode.value)
}

function initMapboxJSMap () {
  L.mapbox.accessToken = mapbox_access_token

  map.value = L.mapbox.map('map')
    .setView([59.935446, 30.328063], 12)
    .addLayer(L.mapbox.styleLayer(map_styles.value))

  bridges_map_layer.value = L.mapbox
    .featureLayer()
    .addTo(map.value)

  // Делаем карту и слой глобальными для доступа из других компонентов
  window.map = map.value
  window.bridges_map_layer = bridges_map_layer.value

  setGeoJSON()
}

function setupMapLayers () {
  const geoJson = Features.value

  map.value.loadImage('/map_icons/car.png', function (error, image) {
    if (error) {
      console.error('Failed to load car icon:', error)
      return
    }
    map.value.addImage('car', image)
  })
  map.value.loadImage('/map_icons/boat.png', function (error, image) {
    if (error) {
      console.error('Failed to load boat icon:', error)
      return
    }
    map.value.addImage('boat', image)
  })
  map.value.loadImage('/map_icons/cinema.png', function (error, image) {
    if (error) {
      console.error('Failed to load cinema icon:', error)
      return
    }
    map.value.addImage('cinema', image)
  })

  map.value.addSource('points', { 'type': 'geojson', 'data': geoJson })

  map.value.addLayer({
    'id': 'circles',
    'type': 'circle',
    'source': 'points',
    'paint': {
      'circle-stroke-color': ['get', 'custom_active_color'],
      'circle-stroke-width': ['get', 'custom_active_stroke_size'],
      'circle-color': ['get', 'marker-color'],
      'circle-radius': 16
    }
  })

  map.value.addLayer({
    'id': 'symbols',
    'type': 'symbol',
    'source': 'points',
    'layout': {
      'icon-image': ['get', 'marker-symbol'],
      'text-field': [
        'format',
        ['upcase', ['get', 'title']], { 'font-scale': 0.8 },
        '\n', {},
        ['downcase', ['get', 'custom_comment']], { 'font-scale': 0.6 }
      ],
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-offset': [0, 0.8],
      'text-anchor': 'top'
    },
    paint: {
      'text-color': dark_mode.value ? '#fff' : '#000'
    }
  })
}

function initMapboxGLMap () {
  map.value = new mapboxgl.Map({
    container: 'map',
    style: map_styles.value,
    center: [30.374144114706155, 59.90882829669761],
    zoom: 11,
    pitch: 45,
    bearing: -17.6,
    antialias: true
  })

  // Делаем карту глобальной для доступа из других компонентов
  window.map = map.value

  map.value.on('load', function () {
    setupMapLayers()

    map.value.on('click', 'circles', function (e) {
      store.setOpen_bridge(e.features[0].id)
    })
  })
}

function setGeoJSON () {
  const geoJson = Features.value
  if (!bridges_map_layer.value) return
  bridges_map_layer.value.setGeoJSON(geoJson)
}

function setMarkerData () {
  const geoJson = Features.value
  if (!map.value || typeof map.value.getSource !== 'function') return
  if (!map.value.getSource('points')) return
  map.value.getSource('points').setData(geoJson)
}

watch(dark_mode, () => {
  if (map.value && store.gl_support) {
    map.value.setStyle(map_styles.value)
    // После setStyle все источники и слои уничтожаются — восстанавливаем их
    map.value.once('style.load', () => {
      setupMapLayers()
    })
  } else {
    checkSupportGLBrowser()
  }
  $q.dark.set(dark_mode.value)
})

watch(Features, () => {
  if (store.gl_support) {
    setMarkerData()
  } else {
    setGeoJSON()
  }
})

onUnmounted(() => {
  if (map.value && typeof map.value.remove === 'function') {
    map.value.remove()
  }
  // Очищаем глобальные ссылки
  window.map = null
  window.bridges_map_layer = null
})

defineExpose({ checkSupportGLBrowser })
</script>

<style lang="scss">
  body.mobile {
    .mapboxgl-popup {
      bottom: 50px;
      top: auto;
      left: 50%;
      transform: translateX(-50%) !important;

      .mapboxgl-popup-tip {
        display: none;
      }
    }
  }

  #map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;

    h6 { margin: 0; }
  }

  body.body--dark {
    .leaflet-popup-content {
      background: var(--q-dark);
      color: #fff;
    }
    .mapboxgl-popup .q-card {
      background: #78909c;
      color: white;
    }
  }

  .marker-title { font-size: 20px; }

  .marker-description {
    font-size: 16px;

    .bridge_comment {
      color: #a7a7a7;
      font-size: 14px;
      margin-bottom: 10px;
    }

    b { color: #792ec0; }
  }

  .mapboxgl-popup {
    position: absolute;
    min-width: 300px;
    font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;

    .mapboxgl-popup-content {
      background: transparent;
      border-radius: 0;
      box-shadow: none;
      padding: 0;
      width: 100%;

      .q-card { width: 100%; }
    }

    .mapboxgl-popup-close-button {
      right: 6px;
      top: 13px;
      z-index: 99;
      font-size: 40px;
    }

    iframe { width: 100%; }
  }
</style>
