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
        color="light-green"
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
                const unix = moment().hour(1).minute(1);
                return +unix;
            },
            slider_max() {
                const unix = moment().hour(6).minute(1);
                return +unix;
            },
            slider_label_value() {
                if( this.slider_value === null ){
                    return 0;
                }
                return moment(this.slider_value).format("HH:mm")
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
