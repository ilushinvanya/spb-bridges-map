<template>
  <q-card
    v-touch-pan.vertical.prevent.mouse="handleSwipe"
    class="bridge-card relative-position"
    :class="{ hide_to_bottom }"
    :style="{ 'bottom': offset + 'px' }"
  >
    <q-btn
      dense
      unelevated
      round
      color="blue-grey-5"
      icon="clear"
      style="top:-10px; right:-10px; z-index: 9"
      class="absolute-top-right"
      @click="open_bridge_id = 0"
    />

    <q-slide-transition>
      <q-video v-if="camera"
               class="height_300"
               :src="open_bridge_obj.custom_youtube_url" />
      <div v-else
             v-show="!collapse">
      <q-img
             class="responsive"
             :src="open_bridge_obj.poster_image"/>
      </div>
    </q-slide-transition>

    <q-card-section @click="collapse = !collapse">
      <div class="text-h6 ellipsis" >
        {{ open_bridge_obj.title }}
        <q-badge
          v-if="!camera"
          align="top"
          :color="open_bridge_obj.custom_status_color"
          v-html="open_bridge_obj.custom_status_text"></q-badge>
      </div>
      <div  v-if="!camera"
            class="text-caption text-grey">
        {{ open_bridge_obj.custom_comment }}
      </div>
    </q-card-section>

    <q-separator/>

    <q-card-section v-if="!camera">
      <div style="margin-left: -4px">
        <q-chip
          v-for="(time, index) in times_chip"
          :key="index"
          :style="{ backgroundColor: time.includes('<b>') ? open_bridge_obj['marker-color'] : '' }"
          :text-color="time.includes('<b>') ? 'white' : ''"
          icon="schedule"
        >
          <div v-html="time"></div>
        </q-chip>
      </div>

    </q-card-section>

    <q-separator/>

    <q-slide-transition>
      <q-card-actions
        v-if="!camera"
        class="q-pa-none"
        v-show="!collapse">
        <div class="q-pa-md">
          <q-btn
            outline
            no-caps
            icon="link"
            color="primary"
            type="a"
            target="_blank"
            :href="open_bridge_obj.custom_url"
            :label="$t('mostotrest')"
          />
        </div>
      </q-card-actions>
    </q-slide-transition>

  </q-card>
</template>

<script>
    export default {
        name: 'Bridge_card',
        data() {
            return {
                offset: 0,
                collapse: true,
                hide_to_bottom: true,
                is_final_after_collapse: true
            }
        },
        computed: {
            camera(){
                return this.open_bridge_id === 14;
            },
            Features() {
                return this.$store.state.geoJson_features
            },
            open_bridge_id: {
                get(){
                    return this.$store.state.open_bridge_id
                },
                set(value){
                    this.$store.commit("setOpen_bridge", value)
                }
            },
            open_bridge_obj() {
                const feature = this.Features.features.find(feature => {
                    if (feature.id === this.open_bridge_id) {
                        return feature;
                    }
                });
                return feature.properties;
            },
            times_chip() {
                return this.open_bridge_obj.custom_time_html.split("<br>").map(time_string => {
                    return time_string
                });
            }
        },
        mounted() {
            if (this.camera){
                this.collapse = false;
            }
            this.hide_to_bottom = false;
        },
        methods: {
            handleSwipe({evt, ...info}) {
                if (info.direction === "up") {
                    this.collapse = false;
                    this.is_final_after_collapse = false;
                } else if (info.direction === "down") {

                    if ( info.isFinal ){
                        this.is_final_after_collapse = true;
                    }

                    if ( this.collapse === false ) {
                        this.collapse = true;
                    }

                    if ( this.collapse === true ) {

                        if ( this.is_final_after_collapse ){
                            this.offset -= info.delta.y;
                            if (info.isFinal) {
                                if (this.offset < -100) {
                                    this.hide_to_bottom = true;
                                    setTimeout(() => {
                                        this.open_bridge_id = 0;
                                    }, 400);
                                } else {
                                    this.offset = 0
                                }
                            }
                        }

                    }
                }
            }
        }
    }
</script>

<style lang="scss">
  .height_300 {
    height: 300px;
  }
  .bridge-card {
    width: 100%;
    margin: 0 auto 10px;

    & * {
      user-select: none;
    }
  }
</style>
