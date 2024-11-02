<script setup lang="ts">
defineProps({
  modelValue: String
})
defineEmits([
  'update:modelValue'
])
</script>

<template>
  <div>
    <h4>Brick Buddy</h4>
    <button @click="$emit('update:modelValue', 'stores')">
      Stores
    </button>
    <button @click="$emit('update:modelValue', 'shopLists')">
      Shopping Lists
    </button>
    <button @click="$emit('update:modelValue', 'colors')">
      Colors
    </button>
    <button @click="$emit('update:modelValue', 'searches')">
      Searches
    </button>
    <button @click="$emit('update:modelValue', 'items')">
      Items
    </button>
  </div>
</template>