<template>
  <q-card
    class="slider_card"
    v-touch-pan.vertical.prevent.mouse="handleSwipe"
    :class="{ hide_to_bottom }"
    :style="{ 'bottom': offset + 'px' }">
    <q-card-section>

        <q-btn
          dense
          unelevated
          round
          color="blue-grey-5"
          icon="clear"
          style="top:-10px; right:-10px"
          class="absolute-top-right z-max"
          @click="close()"
        />



      <q-slider
        v-model="slider_value"
        :min="slider_min"
        :max="slider_max"
        :step="60"
        label
        label-always
        :label-value="slider_label_value"
        color="green"
      />


    </q-card-section>
  </q-card>
</template>

<script>
    export default {
        name: 'Slider',
        data() {
            return {
                slider_value: null,
                offset: 0,
                hide_to_bottom: true
            }
        },
        computed:{
            slider_min() {
                const unix = this.$moment().hour(1).minute(0);
                return +unix;
            },
            slider_max() {
                const unix = this.$moment().hour(6).minute(0);
                return +unix;
            },
            slider_label_value() {
                if( this.slider_value === null ){
                    return 0;
                }

                let return_string = "";
                const moment_slider_value_format = this.$moment(this.slider_value).format("HH:mm");
                return_string += moment_slider_value_format;

                if (moment_slider_value_format === this.showSunriseSunset.sunset){
                    return_string += " 🌇";
                }
                if (moment_slider_value_format === this.showSunriseSunset.sunrise){
                    return_string += " 🌅";

                }

                return return_string
            },

            yandex_clock() {
                return this.$store.state.yandex_clock;
            },
            showSunriseSunset(){
                if (this.yandex_clock.hasOwnProperty("showSunriseSunset")){
                    if(this.yandex_clock.showSunriseSunset){
                        if (!this.yandex_clock.hasOwnProperty("sunset")) return false;
                        if (!this.yandex_clock.hasOwnProperty("sunrise")) return false;

                        return {
                            sunset: this.yandex_clock.sunset,
                            sunrise: this.yandex_clock.sunrise
                        }
                    }
                }
                return false;
            },
        },
        mounted(){
            this.hide_to_bottom = false;
            if ( this.$moment(this.$store.state.timing_mode).isBetween(this.slider_min, this.slider_max, undefined, '[)')) {
                this.slider_value = this.$store.state.timing_mode;
            }

        },
        methods:{
            close(){
                this.$store.commit("setTiming_mode", null)
            },
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
                                    this.close()
                                }, 400);
                            } else {
                                this.offset = 0
                            }
                        }
                    }
                }
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
  .slider_card {
    width: 100%;
    position: relative;
    margin: 0 auto 10px;
    z-index: 1001;
  }
</style>
