<template>
  <div id="map"></div>
  <WebcamDialog v-model="showWebcamDialog" />
</template>

<script setup lang="ts">
import { computed, watch, shallowRef, onUnmounted, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useBridgesStore } from '@/stores/bridges'
import WebcamDialog from './WebcamDialog.vue'

const store = useBridgesStore()
const $q = useQuasar()
const { t } = useI18n()
const showWebcamDialog = ref(false)

const map = shallowRef<L.Map | null>(null)
const geoJsonLayer = shallowRef<L.GeoJSON | null>(null)
const zoom = ref(12)

const dark_mode = computed(() => store.dark_mode)

const Features = computed(() => {
  const bridgesFeatures = store.geoJson_features.features

  return store.geoJson_features
  return {
    ...store.geoJson_features,
    features: [
      ...bridgesFeatures,
      {
        id: 999,
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [30.318306, 59.941057] },
        properties: {
          custom_active_color: 'white',
          custom_active_stroke_size: 1,
          custom_status_color: 'blue',
          custom_status_text: '📷',
          custom_comment: t('webcam'),
          title: t('webcam'),
          description: t('bridge_webcam'),
          'marker-color': '#00bcd4',
          'marker-symbol': 'camera',
          'marker-size': 'large',
        },
      }
    ]
  }
})

// Определяем иконки для маркеров с кружком
const getIcon = (markerSymbol: string, markerColor: string, strokeColor: string = 'white', strokeWidth: number = 1, title: string = '', comment: string = '') => {
  const circleSize = 30 + (strokeWidth * 2)

  // Создаем HTML для маркера с кружком и иконкой
  const html = `
    <div class="bridge-marker-container" style="--circle-size: ${circleSize}px; --marker-color: ${markerColor}; --stroke-color: ${strokeColor}; --stroke-width: ${strokeWidth}px;">
      <div class="bridge-marker-circle">
        <img src="/map_icons/${markerSymbol}.png" alt="${markerSymbol}" class="bridge-marker-icon" />
      </div>
      <div class="bridge-marker-text">
        <div class="bridge-marker-title">${title}</div>
        <div class="bridge-marker-comment">${comment}</div>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    iconSize: [circleSize, circleSize],
    iconAnchor: [circleSize / 2, circleSize],
    popupAnchor: [0, -(circleSize / 2)],
    className: 'bridge-marker-wrapper'
  })
}

// Обновляем слой GeoJSON данными
const updateGeoJsonLayer = () => {
  if (!map.value) return

  const geoJson = Features.value

  // Удаляем старый слой если он есть
  if (geoJsonLayer.value) {
    map.value.removeLayer(geoJsonLayer.value)
  }

  // Создаем новый GeoJSON слой
  geoJsonLayer.value = L.geoJSON(geoJson, {
    pointToLayer: (feature, latlng) => {
      const props = feature.properties

      const strokeColor = props['custom_active_color'] || 'white'
      const strokeWidth = props['custom_active_stroke_size'] || 1
      const icon = getIcon(
        props['marker-symbol'],
        props['marker-color'],
        strokeColor,
        strokeWidth,
        props.title,
        props['custom_comment']
      )

      const marker = L.marker(latlng, { icon })

      // Обработчик клика - выбираем мост в карточке
      marker.on('click', () => {
        if (props['marker-symbol'] === 'camera') {
          showWebcamDialog.value = true
        } else {
          store.setOpen_bridge(feature.id)
        }
      })

      return marker
    }
  }).addTo(map.value)
}


const mapbox_access_token = import.meta.env.VITE_MAPBOX_TOKEN

const map_styles = computed(() =>
    dark_mode.value
        ? 'https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/256/{z}/{x}/{y}?access_token=' + mapbox_access_token
        : 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=' + mapbox_access_token
)

// Инициализация карты с OpenStreetMap
const initMap = () => {
  // Удаляем старую карту если она есть
  if (map.value) {
    map.value.remove()
    map.value = null
  }

  // Инициализируем карту с центром на Санкт-Петербурге
  map.value = L.map('map').setView(
    [59.935446, 30.328063],
    zoom.value
  )

  // Добавляем слой OpenStreetMap
  L.tileLayer(
      map_styles.value, {
        minZoom: 10,
        maxZoom: 15,
    }
  ).addTo(map.value)

  // Делаем карту глобальной для доступа из других компонентов
  window.map = map.value

  // Слушаем события зума
  map.value.on('zoomend', () => {
    zoom.value = map.value!.getZoom()
  })

  store.setGLSupport(true)
  $q.dark.set(dark_mode.value)

  // Обновляем GeoJSON слой
  setTimeout(() => {
    updateGeoJsonLayer()
  }, 100)
}

// Смена темы оформления
const updateTileLayer = () => {
  if (!map.value) return

  // Удаляем все слои тайлов
  map.value.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map.value!.removeLayer(layer)
    }
  })

  // Добавляем новый слой в зависимости от темы
  L.tileLayer( map_styles.value,  {
      minZoom: 10,
      maxZoom: 15,
    }
  ).addTo(map.value)
}

// Смотрим изменения Features и обновляем GeoJSON слой
watch(
  Features,
  () => {
    updateGeoJsonLayer()
  },
  { debounce: 50 }
)

// Смотрим изменения темы и обновляем стили карты
watch(dark_mode, () => {
  $q.dark.set(dark_mode.value)
  if (map.value) {
    updateTileLayer()
  }
})

onMounted(() => {
  document.querySelector('#load')?.remove()
  // Загружаем данные мостов перед инициализацией карты
  store.getBridges().then(() => {
    initMap()
  }).catch((error) => {
    console.error('Failed to load bridges:', error)
    initMap()
  })
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
  // Очищаем глобальные ссылки
  window.map = null
})

</script>

<style lang="scss">
  #map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;

    h6 { margin: 0; }
  }

  .bridge-marker-wrapper {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .bridge-marker-container {
    position: relative;
    width: var(--circle-size);
    height: var(--circle-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bridge-marker-circle {
    position: absolute;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--marker-color);
    border: var(--stroke-width) solid var(--stroke-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bridge-marker-icon {
    width: 32px;
    height: 17px;
    display: block;
    pointer-events: none;
    user-select: none;
  }

  .bridge-marker-text {
    display: flex;
    position: absolute;
    top: calc(var(--circle-size) + 4px);
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    color: #000;
    pointer-events: none;
    user-select: none;
    z-index: 10;
    flex-direction: column;
    align-items: center;
  }

  .bridge-marker-title {
    display: v-bind("zoom > 12 ? 'inline' : 'none'");
    font-size: 14px;
    font-weight: 600;
    color: #2e2e2e;
    background: rgb(255 255 255);
    border-radius: 5px;
    padding: 2px 6px;
  }

  .bridge-marker-comment {
    display: inline;
    font-size: 12px;
    font-weight: 500;
    color: #333;
    margin-top: -3px;

    background: rgb(255 255 255);
    border-radius: 5px;
    padding: 0 6px;
  }

  body.mobile {
    // Убрали стили popups - инфо показывается в карточках внизу
  }

  body.body--dark {
    .bridge-marker-title {
      color: #fff;
      background: rgb(0 0 0);
    }

    .bridge-marker-comment {
      color: #ccc;
      background: rgb(0 0 0);
    }
  }

  .leaflet-container {
    font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
  }

</style>
