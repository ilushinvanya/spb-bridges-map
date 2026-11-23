<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref} from 'vue'

  const open = ref(true)
  const isShow = ref(false)

  onMounted(() => {
    const script = document.createElement('script')
    script.src =
        'https://experience.tripster.ru/partner/widget.js?experiences=13570%2C58104%2C70759&view=experience&template=horizontal&mobile=list&order=top&num=3&label=bridges&version=2&partner=hermitage-map&features=logo%2Cprice&script_id=tripster-widget-724093'
    script.async = true
    script.id = 'tripster-widget-724093'
    script.addEventListener('load', () => {
      console.log('script loaded')
      isShow.value = true
    })

    nextTick(() => {
      document.getElementById('tripster-wrapper')?.appendChild(script)
      isShow.value = true
    })
  })
</script>

<template>
<div>
  <q-dialog v-model="open" persistent v-show="isShow">
    <q-card>
      <q-card-section class="row items-center q-pb-none" >
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div id="tripster-wrapper"></div>
      </q-card-section>
    </q-card>
  </q-dialog>
</div>
</template>

<style scoped lang="scss">

</style>