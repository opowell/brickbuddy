<script setup lang="ts">
import { PAGES } from '../constants'
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
    <button @click="$emit('update:modelValue', PAGES.STORES)">
      Stores
    </button>
    <button @click="$emit('update:modelValue', PAGES.SHOP_LISTS)">
      Shopping Lists
    </button>
    <button @click="$emit('update:modelValue', PAGES.COLORS)">
      Colors
    </button>
    <button @click="$emit('update:modelValue', PAGES.SEARCHES)">
      Searches
    </button>
    <button @click="$emit('update:modelValue', PAGES.PARTS)">
      Parts
    </button>
  </div>
</template>