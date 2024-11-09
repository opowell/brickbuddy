<script setup lang="ts">
import { UiItem, UiStore } from '../types';
import { Crumbs } from '../constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
const { store } = defineProps({
  store: Object as PropType<UiStore>
})

const router = useRouter()
const href = computed(() => {
  if (!store) {
    return
  }
  return Crumbs.store(store.sId).href
})
</script>


<template>
  <button v-if="store" @click="router.push(href)">
    {{ store?.name }}
  </button>
</template>