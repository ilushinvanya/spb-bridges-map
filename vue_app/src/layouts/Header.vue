<template>
  <q-header reveal elevated class="bg-blue-grey-5 text-white">
    <q-toolbar>
      <q-btn dense flat round icon="menu" @click="left_handle()"/>

      <q-toolbar-title class="flex items-center no-wrap">
        <q-avatar
          v-if="weather"
          color="white"
          class="q-mr-sm"
          text-color="black">
          <div class="temp text-weight-bold">{{ weather.temp }}°</div>
          <img v-if="!hide_weather_icon"
               class="absolute"
               :src="'https://yastatic.net/weather/i/icons/blueye/color/svg/' + weather.icon + '.svg'"
               @error="hide_weather_icon = true"
          />
        </q-avatar> <div> {{ $t('header_title') }} 🌉</div>
      </q-toolbar-title>

      <q-btn dense flat round icon="menu" @click="right_handle()"/>
    </q-toolbar>
  </q-header>
</template>

<script>

    export default {
        name: 'HeaderComponent',
        data() {
            return {
                hide_weather_icon: false
            }
        },
        props:["left", "right"],
        computed:{
            yandex_clock() {
                return this.$store.state.yandex_clock;
            },
            weather(){
                if (this.yandex_clock.hasOwnProperty("weather")){
                    return this.yandex_clock.weather;
                }else{
                    return false
                }
            }

        },
        mounted(){
        },
        methods:{
            left_handle(){
                this.$emit("left", !this.left);
            },
            right_handle(){
                this.$emit("right", !this.right);
            }
        },
        watch:{

        }
    }
</script>

<style lang="scss">
  .temp {
    font-size: 15px;
    letter-spacing: -2px;
    color: #4a4c4d;
    position: relative;
    z-index: 9;
  }
</style>
