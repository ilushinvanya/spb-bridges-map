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
          <q-item-label><div>{{bridge.title[app_language]}}</div></q-item-label>
          <q-item-label caption>{{bridge.comment}}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-item-label caption>

            <div class="text-right"
                 style="width:92px"
                 v-html="bridge.list_description"></div>
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
            app_language() {
                return this.$i18n.locale;
            },
            bridges_with_params() {
                return this.$store.state.bridges_with_params
            },
            gl_support() {
                return this.$store.state.gl_support;
            }
        },
        methods: {
            parseTimeObj(bridge_time_array){
                // {"start":"2:00","end":"3:45"},{"start":"4:15","end":"5:45"}]
                return bridge_time_array.map(time_obj=>{
                    let result_string = "";
                    const start = time_obj.start;
                    const end = time_obj.hasOwnProperty("end") ? time_obj.end : false;

                    result_string += start;
                    if ( end ){
                      result_string += ' - ' + end;
                    }
                    return result_string;
                }).join("<br/>")

            },
            handleClickBridge(bridge) {

                if ( this.gl_support ){

                    window.bridges_map_layer.forEach((marker) => {
                        if ( marker.getPopup().isOpen() ){
                            marker.togglePopup();
                        }

                        if ( marker.getPopup()["_content"].innerText.includes(bridge.title[this.app_language]) ){
                            marker.togglePopup();
                        }
                    });


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
