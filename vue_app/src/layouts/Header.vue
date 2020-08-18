<template>
  <q-header reveal elevated class="bg-blue-grey-5 text-white">
    <q-toolbar>
      <q-btn dense flat round icon="menu" @click="left_handle()"/>

      <q-toolbar-title class="flex items-center no-wrap">
        <h1> 🌉 <span>{{ $t('header_title') }}</span> </h1>
      </q-toolbar-title>

      <q-btn
        icon="menu"
        no-caps
        color="teal-5"
        :label="$t('header_button')"
        @click="right_handle()"/>
    </q-toolbar>
  </q-header>
</template>

<script>

    export default {
        name: 'HeaderComponent',
        data() {
            return {

            }
        },
        props:["left", "right"],
        computed:{
            yandex_clock() {
                return this.$store.state.yandex_clock;
            },


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
  h1 {
    font-size: 30px;
    line-height: 30px;
    margin: 0;
    padding: 0;
    span {
      font-size: 21px;
    }
  }
  .temp {
    font-size: 15px;
    letter-spacing: -2px;
    color: #4a4c4d;
    position: relative;
    z-index: 9;
  }
</style>
