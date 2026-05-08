<template>
  <q-layout view="hHh lpR fFf">

    <HeaderComponent
      :left="left"
      @left="left = $event"
      :right="right"
      @right="right = $event"
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

<script setup>
import { ref } from 'vue'
import RightSideBar from './RightSideBar.vue'
import LeftSideBar from './LeftSideBar.vue'
import HeaderComponent from './Header.vue'
import FooterComponent from './Footer.vue'
import { onMounted } from 'vue'
import { useBridgesStore } from 'src/stores/bridges'

const store = useBridgesStore()

onMounted(() => {
  store.getBridges()
})

const left = ref(false)
const right = ref(false)
</script>
