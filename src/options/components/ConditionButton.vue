<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
const { condition } = defineProps({
  condition: String as PropType<string>
})
const router = useRouter()
const href = computed(() => {
  if (!condition) {
    return
  }
  return Crumbs.condition(condition).href
})
</script>

<template>
  <button v-if="condition" @click="router.push(href)">
    {{ condition }}
  </button>
</template>