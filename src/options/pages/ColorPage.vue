<script setup lang="ts">
const { color } = defineProps({
  color: Object
})
const emits = defineEmits(['goHome', 'goColors'])
</script>

<template>
  <div>
    <button @click="$emit('goHome')">
      Home
    </button>
    <button @click="$emit('goColors')">
      Colors
    </button>
    <h4>{{ color.name }}</h4>
    <div>Id: {{ color.id }}</div>
    <h4>Part variants</h4>
    <h4>Shop list items</h4>
    <h4>Inventory items</h4>
  </div>
</template>