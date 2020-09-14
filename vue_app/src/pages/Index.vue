<template>
  <q-page class="flex flex-center overflow-hidden">

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


    <Map ref="main_map" />

    <map_data @update_map_data="trigger_update_map"
              @init_map="trigger_init_map"/>

    <div class="bottom_block_w_cards">
      <BridgeCard v-if="open_bridge"/>
      <SliderCard v-if="timing_mode"/>
    </div>

  </q-page>
</template>

<script>
    import Map from "./Map.vue"
    import map_data from "./map_data.vue"
    import SliderCard from "../components/SliderCard";
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
                transition_class: "up"
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
    min-width: 420px;
    max-width: 420px;
    bottom: 0;
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
    height: calc(100vh - 100px);

    h6 {
      margin: 0;
    }
  }

  body.body--dark {
    .leaflet-popup-content {
      background: var(--q-color-dark);
      color: #fff;
    }

    .mapboxgl-popup {
      .q-card {
        background: #78909c;
        color: white;
      }
    }
  }

  .marker-title {
    font-size: 20px;
  }

  .marker-description {
    font-size: 16px;

    .bridge_comment {
      color: #a7a7a7;
      font-size: 14px;
      margin-bottom: 10px;
    }

    b {
      color: #792ec0;
    }
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

      .q-card {
        width: 100%;
      }
    }

    .mapboxgl-popup-close-button {
      right: 6px;
      top: 13px;
      z-index: 99;
      font-size: 40px;
    }

    iframe {
      width: 100%;
    }
  }

</style>
