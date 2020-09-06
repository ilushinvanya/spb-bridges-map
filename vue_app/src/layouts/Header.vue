<template>
  <q-header reveal elevated class="bg-blue-grey-5 text-white">
    <q-toolbar class="custom_toolbar_class">


      <q-toolbar-title class="flex items-center no-wrap">
        <h1>{{ $t('header_title') }} 🌉</h1>
      </q-toolbar-title>

      <q-tabs
        indicator-color="transparent"
        inline-label>

        <q-tab
          icon="menu"
          no-caps
          :label="$t('header_toolbar_tab_menu')"
          @click="left_handle()"
        />

        <q-tab
          no-caps
          :label="$t('header_toolbar_tab_list')"
          @click="right_handle()"
        />
      </q-tabs>

    </q-toolbar>



  </q-header>
</template>

<script>

    export default {
        name: 'HeaderComponent',
        props: ["left", "right"],
        computed: {

        },
        methods: {
            left_handle() {
                this.$emit("left", !this.left);
            },
            right_handle() {
                this.$emit("right", !this.right);
            }
        }
    }
</script>

<style lang="scss">
  body.mobile {
    .custom_toolbar_class {
      flex-direction: column;
      h1 {
        text-align: center;
      }
    }
  }
  h1 {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    line-height: 50px;
    font-size: 21px;
  }
</style>
