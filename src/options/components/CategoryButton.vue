<script setup lang="ts">
import { Category } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
const { category } = defineProps({
  category: Object as PropType<Category>
})
const router = useRouter()
const href = computed(() => {
  if (!category) {
    return
  }
  return Crumbs.category(category.name, category.id).href
})
</script>

<template>
  <button v-if="category" @click="router.push(href)">
    {{ category.name }}
  </button>
</template>