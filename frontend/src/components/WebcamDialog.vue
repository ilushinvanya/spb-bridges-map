<template>
  <q-dialog v-model="isOpen" @hide="onDialogHide" full-height full-width>
    <q-card class="webcam-dialog-card">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ $t('webcam') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="isOpen = false" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md" style="height: calc(100% - 70px)">
          <iframe
            src="https://rutube.ru/play/embed/86e2f45785378c866d212e7f5f5447b0/"
            allow="clipboard-write; autoplay"
            allowFullScreen
            autostartmute="false"
            autoplay="true"
          ></iframe>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
})

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
})

const onDialogHide = () => {
  isOpen.value = false
}
</script>

<style lang="scss" scoped>
.webcam-dialog-card {
  min-width: 300px;
  max-width: 90vw;
  width: 100%;

  @media (min-width: 600px) {
    min-width: 600px;
  }
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
}

</style>
