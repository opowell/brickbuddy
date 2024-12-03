<script setup lang="ts">
import { ExternalCategory } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
import NameIdLabel from './NameIdLabel.vue';
const { category } = defineProps({
  category: Object as PropType<ExternalCategory>
})
const router = useRouter()
const href = computed(() => {
  if (!category) {
    return
  }
  return Crumbs.externalCategory(category.name, category.id, category.type).href
})
</script>

<template>
  <button v-if="category" @click="router.push(href)">
    <NameIdLabel :name="category.name" :id="category.type + ' ' + category.id" />
  </button>
</template>