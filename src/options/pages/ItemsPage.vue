<script setup lang="ts">
import type { UiItem } from '../types';
const { items } = defineProps({
  items: Array<UiItem>
})
defineEmits(['goHome', 'goItem'])
const search = ref('')
const filteredParts = computed(() => {
  if (!items) {
    return []
  }
  return items.filter((item: UiItem) => item.itemName.includes(search.value))
})
</script>

<template>
  <div v-if="items">
    <button @click="$emit('goHome')">
      Home
    </button>
    <h4>Parts ({{ filteredParts.length }} / {{ items.length }})</h4>
    <div>Search: <input v-model="search"></div>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Id</th>
          <th>Name</th>
          <th>Category</th>
          <th>Colors</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredParts" :key="item.itemId">
          <td><img v-if="item.variants.length" :src="item.variants[0].image"></td>
          <td>{{ item.itemId }}</td>
          <td>
            <button @click="$emit('goItem', item)">
              {{ item.itemName }}
            </button>
          </td>
          <td>{{ item.categoryString }}</td>
          <td>{{ item.variants.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>