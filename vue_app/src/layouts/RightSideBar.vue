<template>
  <div class="q-pa-none">
    <q-list>


      <q-item v-for="bridge in bridges_with_params"
              @click="handleClickBridge(bridge)"
              :key="bridge.link"
              clickable
              v-ripple>
        <q-item-section avatar>
          <q-avatar size="30px" :style="{backgroundColor: bridge.marker_color}"/>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{bridge.title[app_language]}}</q-item-label>
          <q-item-label caption>{{bridge.comment}}</q-item-label>
        </q-item-section>


      </q-item>

    </q-list>
  </div>
</template>

<script>
    export default {
        name: 'Bridges_list',
        computed: {
            app_language() {
                return this.$i18n.locale;
            },
            bridges_with_params() {
                return this.$store.state.bridges_with_params
            }
        },
        methods: {
            handleClickBridge(bridge) {
                window.bridges_map_layer.eachLayer((layer) => {
                    if ( bridge.title[this.app_language] === layer.feature.properties.title ){
                        layer.openPopup();
                    }
                });

                const coords = bridge.coordinates;
                window.l_map.panTo(L.latLng(coords[1], coords[0]));
            }
        }
    }
</script>
