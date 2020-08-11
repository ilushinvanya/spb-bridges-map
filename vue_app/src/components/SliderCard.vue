<template>
  <q-card class="slider_card">
    <q-card-section>

      <div class="flex no-wrap justify-between items-start">
        <div></div>

        <q-btn flat round icon="close" @click="close()"/>
      </div>


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
            }
        },
        computed:{
            slider_min() {
                const unix = this.$moment().hour(1).minute(1);
                return +unix;
            },
            slider_max() {
                const unix = this.$moment().hour(6).minute(1);
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

            if (moment(this.$store.state.timing_mode).isBetween(this.slider_min, this.slider_max, undefined, '[)')) {
                this.slider_value = this.$store.state.timing_mode;
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
