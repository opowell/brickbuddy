<script setup lang="ts">
import { excludedCategories, getExcludedCategories } from '../idb/idb';
import { Category } from '../types';

// const excludedCategories = ref<Category[] | undefined>(undefined)
onMounted(async () => {
  // excludedCategories.value = await getExcludedCategories()
})
</script>


<template>
  <button v-if="excludedCategories">Excluded categories: {{ excludedCategories.length }}</button>
</template>