<script setup lang="ts">
import { CategoryWithExternals } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
import NameIdLabel from './NameIdLabel.vue';
const { category } = defineProps({
  category: Object as PropType<CategoryWithExternals>
})
const router = useRouter()
const href = computed(() => {
  if (!category) {
    return
  }
  return Crumbs.category(name.value, category.id).href
})
const name = computed(() => {
  if (!category) {
    return
  }
  return category.externalCategories.map(c => c.name + ' (' + c.type + ' ' + c.id + ')').join(', ')
})
</script>

<template>
  <button v-if="category" @click="router.push(href)">
    <NameIdLabel :name="name" :id="category.id" />
  </button>
</template>