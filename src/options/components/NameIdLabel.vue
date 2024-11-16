<script setup lang="ts">
const { isSpan } = defineProps({
  id: String,
  name: String,
  isSpan: Boolean
})
const tag = computed(() => {
  if (isSpan) {
    return 'span'
  }
  return 'div'
})
</script>


<template>
  <component :is="tag">
    {{ name }} ({{ id }})
  </component>
</template>