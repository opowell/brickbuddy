<script setup lang="ts">
import { getPartsPageParts, startPartScraping, stopPartScrapingFn } from '../idb/idb';
import type { UiItem } from '../types';
import PartButton from '../components/PartButton.vue';
const search = ref('')
const items = ref<UiItem[] | undefined>(undefined)
onMounted(async () => {
  items.value = await getPartsPageParts()
})
const filteredParts = computed(() => {
  if (!items.value) {
    return []
  }
  return items.value.filter((item: UiItem) => item.itemName.includes(search.value))
})
import HomeButton from '../components/HomeButton.vue'
import CategoryButton from '../components/CategoryButton.vue';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
</script>

<template>
  <div v-if="!items">
    Loading...
  </div>
  <div v-else>
    <HomeButton />
    <ActiveSearchButton />
    <h4>Parts ({{ filteredParts.length }} / {{ items.length }})</h4>
    <div>Scrape details from Rebrickable: <button @click="startPartScraping">Start</button></div>
    <div><button @click="stopPartScrapingFn">Stop</button></div>
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
          <td><CategoryButton :category="item.category" /></td>
          <td>{{ item.variants.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>