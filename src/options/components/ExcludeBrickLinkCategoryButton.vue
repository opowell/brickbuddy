<script setup lang="ts">
import { excludeBrickLinkCategory } from '../idb/categories';
import { Category } from '../types';
import { PropType } from 'vue'
const { category } = defineProps({
  category: Object as PropType<Category>
})
const emits = defineEmits(['exclude'])
function exclude() {
  if (!category) {
    return
  }
  excludeBrickLinkCategory(category)
  emits('exclude')
}
</script>

<template>
  <button v-if="category" @click="exclude">
    Exclude
  </button>
</template>