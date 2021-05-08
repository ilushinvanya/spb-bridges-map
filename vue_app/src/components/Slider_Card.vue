<template>
  <q-card
    class="slider_card"
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
            else {
            	let now = new Date();
      				now.setHours(1);
      				now.setMinutes(0);
				      this.slider_value = Date.parse(now);
            }

        },
        methods:{
            close(){
                this.$store.commit("setTiming_mode", null)
            },
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
