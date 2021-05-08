<template>
  <q-header reveal elevated class="bg-blue-grey-5 text-white">
    <q-toolbar class="custom_toolbar_class">


      <q-toolbar-title class="flex no-wrap">
        <h1>{{ $t('header_title') }}</h1>
      </q-toolbar-title>

      <q-tabs
        indicator-color="transparent"
        inline-label>

        <q-tab
          icon="menu"
          no-caps
          :label="$t('header_toolbar_tab_menu')"
          @click="left_handle"
        />

        <q-tab
          no-caps
          :label="$t('header_toolbar_tab_list')"
          color="red"
          :class="{'bg-yellow text-black': show_hint}"
          @click="right_handle"
        >
          <q-tooltip
            v-if="show_hint"
            :value="true"
            content-class="text-subtitle2 bg-yellow text-black"
            :offset="[10, 10]"
          > {{$t('list_hint')}}
          </q-tooltip>
        </q-tab>
      </q-tabs>

    </q-toolbar>



  </q-header>
</template>

<script>

    export default {
        name: 'HeaderComponent',
        props: ["left", "right"],
        computed: {
            show_hint() {
            	  return this.$store.state.show_hint && this.$store.getters['mobilecheck'];
            }
        },
        methods: {
            left_handle() {
                this.$emit("left", !this.left);
            },
            right_handle() {
                this.$store.commit('setShowHint', false);
                this.$emit("right", !this.right);
            }
        }
    }
</script>

<style lang="scss">
  .q-toolbar__title:first-child {
    padding: 0;
  }
  body.mobile {
    .custom_toolbar_class {
      flex-direction: column;
      h1 {
        text-align: center;
      }
    }
  }

  .custom_toolbar_class {
    .ellipsis{
      overflow: visible;
    }
    .q-tab {
      min-height: auto;
    }
  }
  h1 {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    line-height: 50px;
    font-size: 21px;
    position: relative;
    &:after {
      content: "🌉";
      position: absolute;
      right: -35px;
    }
  }
</style>
