<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-blue-grey-5 text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left"/>

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar>
          {{ $t('header_title') }}
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="right = !right"/>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="left" side="left" bordered>
      <LeftSideBar/>
    </q-drawer>

    <q-drawer show-if-above v-model="right" side="right" bordered>
      <RightSideBar/>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer elevated class="bg-blue-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar>
          {{ $t('time_footer') }} -
          {{ Time.format("HH:mm:ss") }}
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>


<script>
    import RightSideBar from '../pages/RightSideBar.vue'
    import LeftSideBar from '../pages/LeftSideBar.vue'


    export default {
        name: 'MainLayout',
        components: {RightSideBar, LeftSideBar},
        data() {
            return {
                left: false,
                right: false
            }
        },
        computed: {
            app_language() {
                return this.$i18n.locale;
            },
            Time() {
                return this.$store.state.Time
            }
        },
        watch:{
            left(newV){
                // console.log(newV)
            }
        }
    }
</script>
