<template>
  <q-header reveal bordered class="bg-blue-grey-5 text-white" :style="headerStyle">
    <q-toolbar class="custom_toolbar_class">

      <q-toolbar-title class="flex no-wrap">
        <h1>{{ $t('header_title') }}</h1>
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
import { computed } from 'vue'
import { useBridgesStore } from 'src/stores/bridges'

const props = defineProps({
  left: Boolean,
  right: Boolean
})

const emit = defineEmits(['left', 'right'])
const store = useBridgesStore()

const yandex_clock = computed(() => store.yandex_clock)

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
  h1 {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    line-height: 50px;
    font-size: 21px;
    position: relative;
  }
</style>
