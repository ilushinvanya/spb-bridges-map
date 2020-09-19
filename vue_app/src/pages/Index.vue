<template>
  <q-page class="flex flex-center overflow-hidden" :style-fn="page_height">

    <div id="legenda"
         :class="transition_class"
         v-touch-swipe.mouse="handleSwipe">

      <q-btn
        flat
        round
        icon="close"
        class="absolute-top-right z-max"
        @click="handleSwipe({direction:'up'})"
      />

      <q-card>
        <q-card-section>
          <q-list>

            <q-item>
              <q-item-section avatar>
                <img src="../assets/pin_ferry.png"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ $t('close') }}</q-item-label>
                <q-item-label caption>{{ $t('will_open') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <img src="../assets/pin_car.png"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ $t('open') }}</q-item-label>
                <q-item-label caption>{{ $t('will_close') }}</q-item-label>
              </q-item-section>
            </q-item>

          </q-list>
        </q-card-section>
      </q-card>
    </div>


    <Map ref="main_map" :min_height = "q_page_min_height"/>

    <map_data @update_map_data="trigger_update_map"
              @init_map="trigger_init_map"/>

    <div class="bottom_block_w_cards">
      <BridgeCard v-if="open_bridge"/>
      <SliderCard v-if="timing_mode"/>
    </div>

  </q-page>
</template>

<script>
    import Map from "../components/Map.vue"
    import map_data from "../components/map_data.vue"
    import SliderCard from "../components/Slider_Card";
    import BridgeCard from "../components/Bridge_Card";

    export default {
        name: 'Index',
        components: {
            SliderCard,
            BridgeCard,
            Map,
            map_data
        },
        data() {
            return {
                transition_class: "up",
                q_page_min_height: 0
            }
        },
        computed: {
            Features(){
                return this.$store.state.geoJson_features
            },
            open_bridge() {
                return this.$store.state.open_bridge_id
            },
            timing_mode() {
                return this.$store.state.timing_mode
            }
        },
        methods: {
            page_height(offset){
                const min_height = offset ? `calc(100vh - ${offset}px)` : '100vh';
                this.q_page_min_height = min_height;
                return { minHeight: min_height }
            },
            trigger_init_map(){
                this.$refs.main_map.checkSupportGLBrowser()
            },
            trigger_update_map(array_features){
                this.$refs.main_map.update_map_data(array_features)
            },
            handleSwipe(e) {
                this.transition_class = e.direction;
                ym(66456622, 'reachGoal', 'hide_legend')
            }
        },
        watch: {
            slider_value(newVal) {
                this.$store.commit("setTiming_mode", newVal)
            }
        }
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

    &.left {
      right: 100%
    }

    &.right {
      right: -300px
    }

    &.up {
      top: -1000px
    }

    &.down {
      top: 100%
    }

    & * {
      user-select: none;
    }
  }

  body.mobile {
    .bottom_block_w_cards {
      width: 90%;
      left: 50%;
      transform: translateX(-50%);
    }
  }




</style>
