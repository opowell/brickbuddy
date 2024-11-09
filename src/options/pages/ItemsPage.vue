<script setup lang="ts">
import type { UiItem } from '../types';
import { items } from '../idb'
import PartButton from '../components/PartButton.vue';
const search = ref('')
const filteredParts = computed(() => {
  if (!items) {
    return []
  }
  return items.value.filter((item: UiItem) => item.itemName.includes(search.value))
})
import HomeButton from '../components/HomeButton.vue'
</script>

<template>
  <div>
    <HomeButton />
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
            <PartButton :part="item" />
          </td>
          <td>{{ item.categoryString }}</td>
          <td>{{ item.variants.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>