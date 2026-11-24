<template>
  <q-header reveal bordered class="bg-blue-grey-5 text-white" :style="headerStyle">
    <q-toolbar class="custom_toolbar_class">

      <q-toolbar-title class="flex no-wrap items-center justify-center">
        <q-carousel
          v-model="nameOfSlide"
          transition-next="fade"
          animated
          height="56px"
          infinite
          :autoplay="30000"
          class="bg-transparent carousel-title"
        >
          <q-carousel-slide name="name-museum">
            <div class="h1">{{ $t('header_title') }}</div>
          </q-carousel-slide>

          <q-carousel-slide name="excursion">
            <a
              class="exc text-white text-no-wrap"
              :href="currentAdvertisement.href"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ $t(currentAdvertisement.text) }}
            </a>
          </q-carousel-slide>
        </q-carousel>
      </q-toolbar-title>

      <q-tabs
        indicator-color="transparent"
        inline-label>

        <q-tab
          icon="more_horiz"
          no-caps
          :label="$t('header_toolbar_tab_menu')"
          @click="left_handle"
        />

        <q-tab
          icon="format_list_bulleted"
          no-caps
          :label="$t('header_toolbar_tab_list')"
          color="red"
          @click="right_handle"
        />

      </q-tabs>

    </q-toolbar>
  </q-header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useBridgesStore, ADVERTISEMENT_LINKS } from 'src/stores/bridges'

const props = defineProps({
  left: Boolean,
  right: Boolean
})

const emit = defineEmits(['left', 'right'])
const store = useBridgesStore()

const nameOfSlide = ref('name-museum')
const yandex_clock = computed(() => store.yandex_clock)

const currentAdvertisement = computed(() => {
  if (ADVERTISEMENT_LINKS.length === 0) {
    return { text: 'header_excursion', href: 'https://mostotrest-spb.ru' }
  }
  return ADVERTISEMENT_LINKS[store.selected_ad_index]
})

const left_handle = () => {
  emit('left', !props.left)
}

const right_handle = () => {
  emit('right', !props.right)
}

const headerStyle = computed(() => {
  if (yandex_clock.value.skyColor) {
    return { 'background-color': yandex_clock.value.skyColor + ' !important' }
  }
  return {}
})

onMounted(() => {
  store.initializeAdvertisement()
})
</script>

<style lang="scss">
  .q-header {
    text-shadow: 0 0 3px black;
  }

  .q-toolbar__title:first-child {
    padding: 0;
  }

  body.mobile {
    .custom_toolbar_class {
      flex-direction: column;
      h1 {
        text-align: center;
      }
    }
  }

  .custom_toolbar_class {
    .ellipsis {
      overflow: visible;
    }
    .q-tab {
      min-height: auto;
    }
  }

  .h1 {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    line-height: 23px;
    font-size: 21px;
    position: relative;
    white-space: nowrap;
  }

  .carousel-title {
    width: 100%;

    :deep(.q-carousel__slides-container) {
      padding: 0;
    }

    .exc {
      cursor: pointer;
      transition: opacity 0.2s ease;
      line-height: 23px;
      font-size: 21px;
      display: block;

      &:hover {
        opacity: 0.8;
      }
    }
  }
</style>
