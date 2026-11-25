<template>
  <q-page class="flex flex-center overflow-hidden full-dvh-height-w-main-page-offset" :style-fn="page_height">

    <Map ref="main_map" />

    <div class="bottom_block_w_cards">
      <TransitionGroup tag="div" name="fade" class="container">
        <BridgeCard v-if="open_bridge"/>
        <SliderCard v-if="timing_mode"/>
        <Summary v-if="summary_visible"/>
      </TransitionGroup>
    </div>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Map from '../components/Map.vue'
import SliderCard from '../components/Slider_Card.vue'
import BridgeCard from '../components/Bridge_Card.vue'
import Summary from '../components/Summary.vue'
import { useBridgesStore } from 'src/stores/bridges'

const store = useBridgesStore()
const main_map = ref<InstanceType<typeof Map> | null>(null)

const open_bridge = computed(() => store.open_bridge_id)
const timing_mode = computed(() => store.timing_mode)
const summary_visible = computed(() => store.summary_visible)

// watch(() => store.map_init_counter, (val) => {
//   // console.log(val)
//   if (val > 0) main_map.value?.checkSupportGLBrowser()
// })

function page_height(offset: number) {
  document.documentElement.style.setProperty(
      '--mainPageOffset',
      `${offset}px`
  );
  return {};
}

</script>

<style lang="scss">
  .bottom_block_w_cards {
    position: absolute;
    width: 420px;
    bottom: 0;
    z-index: 3;
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

  .container {
    position: relative;
    padding: 0;
    list-style-type: none;
  }
  /* 1. объявление transition */
  .fade-move,
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  }

  /* 2. объявление enter from и leave to состояний */
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(12px);
  }

  /* 3. убедитесь, что элементы удалены из потока layout,
        чтобы можно было правильно рассчитать анимацию перемещения */
  .fade-leave-active {
    position: absolute;
  }
</style>
