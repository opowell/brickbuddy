<script setup lang="ts">
import { getParts, getPartsPageParts } from "../idb/parts";
import type { Item, PartsPagePart } from "../types";
import PartButton from "../components/PartButton.vue";
const search = ref("");
// const items = computed<PartsPagePart[] | undefined>(() => {
//   if (!cacheLoaded) {
//     return []
//   }
//   return getPartsPageParts.value
// })
const items = ref();
onMounted(async () => {
  items.value = await getParts();
});
const filteredParts = computed(() => {
  if (!items.value) {
    return [];
  }
  const itemName = "";
  return items.value.filter((item: Item) => {
    return itemName.includes(search.value);
  });
});
const externalCategories = computed(() => {
  if (!liveObjectCache) {
    return new Map();
  }
  return liveObjectCache.externalCategories;
});

import HomeButton from "../components/HomeButton.vue";
import CategoryButton from "../components/CategoryButton.vue";
import ActiveSearchButton from "../components/ActiveSearchButton.vue";
import QuantityInput from "../components/QuantityInput.vue";
import ActiveCartButton from "../components/ActiveCartButton.vue";
import { cacheLoaded, liveObjectCache } from "../idb/idb";
</script>

<template>
  <div v-if="!items || !cacheLoaded">Loading...</div>
  <div v-else>
    <HomeButton />
    <h4>Parts ({{ filteredParts.length }} / {{ items.length }})</h4>
    <div>Search: <input v-model="search" /></div>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Category</th>
          <th>Type</th>
          <th>Colors</th>
          <th title="Price, in Euro cents">Price</th>
          <th>List</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredParts" :key="item.itemId">
          <!-- <td><img v-if="item.image" :src="item.image"></td> -->
          <td></td>
          <td>{{ item.name }}</td>
          <td>
            <CategoryButton
              v-if="externalCategories.get(item.externalCategoryId)"
              :category="externalCategories.get(item.externalCategoryId)"
            />
          </td>
          <td>{{ item.type }}</td>
          <td></td>
          <td></td>
          <!-- <td>
            <PartButton :part="item" />
          </td> -->
          <!-- <td>{{ item.variants.length }}</td>
          <td>{{ item.priceRange }}</td> -->
          <td><QuantityInput :current="0" :max="1000" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
