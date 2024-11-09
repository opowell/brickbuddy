<script setup lang="ts">
import { Category } from '../types';
import { PropType } from 'vue'
import { excludeCategory } from '../idb';
const { category } = defineProps({
  category: Object as PropType<Category>
})
</script>

<template>
  <button v-if="category" @click="excludeCategory(category)">
    Exclude
  </button>
</template>