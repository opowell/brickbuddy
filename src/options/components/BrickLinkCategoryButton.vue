<script setup lang="ts">
import { BrickLinkCategory, Category } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
import NameIdLabel from './NameIdLabel.vue';
const { category } = defineProps({
  category: Object as PropType<BrickLinkCategory>
})
const router = useRouter()
const href = computed(() => {
  if (!category) {
    return
  }
  return Crumbs.brickLinkCategory(category.name, category.id).href
})
</script>

<template>
  <button v-if="category" @click="router.push(href)">
    <NameIdLabel :name="category.name" :id="category.id" />
  </button>
</template>