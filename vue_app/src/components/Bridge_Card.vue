<template>
  <q-card
    v-touch-pan.vertical.prevent.mouse="handleSwipe"
    class="bridge-card"
    :class="{ hide_to_bottom }"
    :style="{ 'bottom': offset + 'px' }"
  >

    <q-slide-transition>
      <q-img class="q-pa-none"
             v-show="!collapse"
             :src="open_bridge_obj.poster_image"/>
    </q-slide-transition>

    <q-card-section>
      <div class="text-h6 ellipsis" @click="collapse = !collapse">
        {{ open_bridge_obj.title }}
        <q-badge
          align="top"
          :color="open_bridge_obj.custom_status_color"
          v-html="open_bridge_obj.custom_status_text"></q-badge>
      </div>
      <div class="text-caption text-grey">
        {{ open_bridge_obj.custom_comment }}
      </div>
    </q-card-section>

    <q-separator/>

    <q-card-section>
      <div style="margin-left: -4px">
        <q-chip
          v-for="time in times_chip"
          :color="time.includes('<b>') ? 'red' : ''"
          :text-color="time.includes('<b>') ? 'white' : 'black'"
          icon="schedule"
        >
          <div v-html="time"></div>
        </q-chip>
      </div>

    </q-card-section>

    <q-separator/>

    <q-slide-transition>
      <q-card-actions
        class="q-pa-none"
        v-show="!collapse">
        <div class="q-pa-sm">
          <q-btn
            icon="event"
            color="primary">
            Reserve
          </q-btn>
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
                hide_to_bottom: true
            }
        },
        computed: {
            Features() {
                return this.$store.state.geoJson_features
            },
            open_bridge_id() {
                return this.$store.state.open_bridge_id
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
            this.hide_to_bottom = false;
        },
        methods: {
            handleSwipe({evt, ...info}) {
                if (info.direction === "up") {
                    this.collapse = false;
                } else if (info.direction === "down") {
                    if (this.collapse === false) {
                        this.collapse = true;
                    } else {
                        this.offset -= info.delta.y;
                        if (info.isFinal) {
                            if (this.offset < -80) {
                                this.hide_to_bottom = true;
                                setTimeout(() => {
                                    this.$store.commit("setOpen_bridge", 0)
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
</script>

<style lang="scss">
  .bridge-card {
    width: 100%;
    margin: 0 auto 10px;


    &.hide_to_bottom {
      transition: bottom .4s linear;
      bottom: -300px !important;
    }

    & * {
      user-select: none;
    }
  }
</style>
