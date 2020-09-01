<template>
  <q-layout view="hHh lpR fFf">

    <HeaderComponent
      :left="left"
      @left="changeLeft"
      :right="right"
      @right="changeRight"
    />

    <q-drawer show-if-above v-model="left" side="left" bordered>
      <LeftSideBar/>
    </q-drawer>

    <q-drawer show-if-above v-model="right" side="right" bordered :width="360">
      <RightSideBar/>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <FooterComponent/>

  </q-layout>
</template>


<script>
    import RightSideBar from './RightSideBar.vue'
    import LeftSideBar from './LeftSideBar.vue'
    import HeaderComponent from './Header.vue'
    import FooterComponent from './Footer.vue'


    export default {
        name: 'MainLayout',
        components: {
            RightSideBar,
            LeftSideBar,
            HeaderComponent,
            FooterComponent
        },
        data() {
            return {
                left: true,
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
        mounted() {
            //
            // setInterval(() => {
            //     this.drawFace(ctx, radius);
            //     this.drawTime(ctx, radius);
            // }, 1000);
        },
        methods: {
            changeLeft(val){ this.left = val },
            changeRight(val){ this.right = val },
        }
    }
</script>
