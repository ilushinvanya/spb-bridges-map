<template>
  <q-page class="flex flex-center overflow-hidden full-dvh-height-w-main-page-offset" :style-fn="page_height">

    <Map ref="main_map" />

    <div class="bottom_block_w_cards">
      <TransitionGroup tag="div" name="fade" class="container">
        <div v-if="open_bridge" key="bridge-card">
          <BridgeCard/>
        </div>

        <div v-if="timing_mode" key="slider-card">
          <SliderCard />
        </div>

        <div v-if="summary_visible" key="summary-card">
          <Summary/>
        </div>
      </TransitionGroup>
    </div>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Map from '../components/Map.vue'
import SliderCard from '../components/Slider_Card.vue'
import BridgeCard from '../components/Bridge_Card.vue'
import Summary from '../components/Summary.vue'
import { useBridgesStore } from '@/stores/bridges'

const store = useBridgesStore()
const main_map = ref<InstanceType<typeof Map> | null>(null)

const open_bridge = computed(() => store.open_bridge_id)
const timing_mode = computed(() => store.timing_mode)
const summary_visible = computed(() => store.summary_visible)

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
    z-index: 401;
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

    & > * {
      transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
      width: 100%;
    }
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    margin-bottom: -20px;
  }

  .fade-leave-active {
    position: absolute !important;
  }
</style>
