<template>
  <div class="q-pa-none">
    <q-list>


      <q-item v-for="bridge in bridges_with_params"
              @click="handleClickBridge(bridge)"
              :key="bridge.link"
              :active="bridge.id === open_bridge_id"
              active-class="bg-teal-3 text-grey-8"
              clickable
              v-ripple>
        <q-item-section avatar>
          <q-avatar size="30px" :style="{backgroundColor: bridge.marker_color}"/>
        </q-item-section>

        <q-item-section>
          <q-item-label><div>{{bridge.title[app_language]}}</div></q-item-label>
          <q-item-label caption>{{bridge.comment}}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-item-label caption>

            <div class="text-right"
                 style="width:92px"
                 v-html="bridge.time_html"></div>
          </q-item-label>
        </q-item-section>


      </q-item>

    </q-list>
  </div>
</template>

<script>
    export default {
        name: 'Bridges_list',
        computed: {
            open_bridge_id(){
                return this.$store.state.open_bridge_id
            },
            app_language() {
                return this.$i18n.locale
            },
            bridges_with_params() {
                return this.$store.state.bridges_with_params
            },
            gl_support() {
                return this.$store.state.gl_support
            }
        },
        methods: {

            handleClickBridge(bridge) {

                if ( this.gl_support ){
                    this.$store.commit("setOpen_bridge", bridge.id)
                }else{

                    window.bridges_map_layer.eachLayer((layer) => {
                        if ( bridge.title[this.app_language] === layer.feature.properties.title ){
                            layer.openPopup();
                        }
                    });
                }

                ym(66456622,'reachGoal','list_' + bridge.link)

                const coords = bridge.coordinates;
                window.map.panTo(L.latLng(coords[1], coords[0]));
            }
        }
    }
</script>
