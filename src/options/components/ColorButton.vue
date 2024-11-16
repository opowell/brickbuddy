<script setup lang="ts">
import { Color } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
const { color } = defineProps({
  color: Object as PropType<Color>
})
const router = useRouter()
const href = computed(() => {
  if (!color) {
    return
  }
  return Crumbs.color(color.name, color.id).href
})
</script>


<template>
  <button v-if="color" @click="router.push(href)">
    {{ color?.name }} ({{ color?.id }})
  </button>
</template>