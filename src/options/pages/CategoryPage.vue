<script setup lang="ts">
const { category } = defineProps({
  category: Object
})
const emits = defineEmits(['goHome', 'goCategories'])
</script>

<template>
  <div v-if="category">
    <button @click="$emit('goHome')">
      Home
    </button>
    <button @click="$emit('goCategories')">
      Categories
    </button>
    <h4>{{ category.name }}</h4>
    <div>Id: {{ category.id }}</div>
    <h4>Parts</h4>
  </div>
</template>