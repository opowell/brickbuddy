<script setup lang="ts">
import { getPartsPageParts } from '../idb/parts';
import type { PartsPagePart } from '../types';
import PartButton from '../components/PartButton.vue';
const search = ref('')
const items = computed<PartsPagePart[] | undefined>(() => {
  if (!cacheLoaded) {
    return []
  }
  return getPartsPageParts.value
})
const filteredParts = computed(() => {
  if (!items.value) {
    return []
  }
  const itemName = ''
  return items.value.filter((item) => {
    return itemName.includes(search.value)
  })
})
import HomeButton from '../components/HomeButton.vue'
import CategoryButton from '../components/CategoryButton.vue';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import NameIdLabel from '../components/NameIdLabel.vue';
import QuantityInput from '../components/QuantityInput.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';
import { cacheLoaded } from '../idb/idb';
</script>

<template>
  <div v-if="!items || !cacheLoaded">
    Loading...
  </div>
  <div v-else>
    <HomeButton />
    <ActiveSearchButton />
    <ActiveCartButton />
    <h4>Parts ({{ filteredParts.length }} / {{ items.length }})</h4>
    <div>Search: <input v-model="search"></div>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Category</th>
          <th>Colors</th>
          <th>Price</th>
          <th>List</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredParts" :key="item.itemId">
          <td><img v-if="item.image" :src="item.image"></td>
          <td>
            <PartButton :part="item" />
          </td>
          <!-- <td><CategoryButton :category="item.category" /></td> -->
          <td>CategoryButton :category="item.category"</td>
          <td>{{ item.variants.length }}</td>
          <td>{{ item.priceRange }}</td>
          <td><QuantityInput :current="0" :max="1000" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>