<template>
  <q-page class="flex flex-center overflow-hidden full-dvh-height-w-main-page-offset" :style-fn="page_height">

    <Map ref="main_map" />

    <div class="bottom_block_w_cards">
      <BridgeCard v-if="open_bridge"/>
      <SliderCard v-if="timing_mode"/>
    </div>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Map from '../components/Map.vue'
import SliderCard from '../components/Slider_Card.vue'
import BridgeCard from '../components/Bridge_Card.vue'
import { useBridgesStore } from 'src/stores/bridges'

const store = useBridgesStore()
const main_map = ref<InstanceType<typeof Map> | null>(null)
const transition_class = ref('up')

const open_bridge = computed(() => store.open_bridge_id)
const timing_mode = computed(() => store.timing_mode)

watch(() => store.map_init_counter, (val) => {
  console.log(val)
  if (val > 0) main_map.value?.checkSupportGLBrowser()
})

function page_height(offset: number) {
  document.documentElement.style.setProperty(
      '--mainPageOffset',
      `${offset}px`
  );
  return {};
}

function handleSwipe(e: { direction: string }) {
  transition_class.value = e.direction
  ym(66456622, 'reachGoal', 'hide_legend')
}
</script>

<style lang="scss">
  .bottom_block_w_cards {
    position: absolute;
    width: 420px;
    bottom: 0;
    z-index: 3;
  }
  #legenda {
    width: 300px;
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 999;
    transition: all .4s ease;

    &.left { right: 100% }
    &.right { right: -300px }
    &.up { top: -1000px }
    &.down { top: 100% }

    & * { user-select: none; }
  }
  .full-dvh-height-w-main-page-offset {
    height: calc(100vh - var(--mainPageOffset));
    height: calc((var(--1dvh, 1vh) * 100) - var(--mainPageOffset));
    height: calc(100dvh - var(--mainPageOffset));
  }

  body.mobile {
    .bottom_block_w_cards {
      width: 90%;
      left: 50%;
      transform: translateX(-50%);
    }
  }
</style>
