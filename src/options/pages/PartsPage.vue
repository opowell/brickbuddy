<script setup lang="ts">
import { getParts, getPartsPageParts } from "../idb/parts";
import type { ExternalItem, Item, PartsPagePart } from "../types";
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
  const out = [];
  for (let i = 0; i < items.value.length && out.length < 100; i++) {
    const item = items.value[i];
    if (!item.name) {
      continue;
    }
    if (item.name.includes(search.value) || item.externalItemId.includes(search.value)) {
      out.push(item);
    }
  }
  return out;
});

import CategoryButton from "../components/CategoryButton.vue";
import QuantityInput from "../components/QuantityInput.vue";
import { cacheLoaded, liveObjectCache } from "../idb/idb";
import ExternalCategoryButton from "../components/ExternalCategoryButton.vue";
</script>

<template>
  <div v-if="!items || !cacheLoaded">Loading...</div>
  <div v-else>
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
          <td>
            <img
              v-if="liveObjectCache.partImages.value.get(item.type + item.externalItemId)"
              :src="liveObjectCache.partImages.value.get(item.type + item.externalItemId)"
            />
          </td>
          <td>{{ item.itemId }}</td>
          <td>{{ item.name }} ({{ item.itemId }})</td>
          <td>
            <ExternalCategoryButton
              v-if="
                liveObjectCache.externalCategories.value.get(
                  item.type + item.externalCategoryId
                )
              "
              :category="
                liveObjectCache.externalCategories.value.get(
                  item.type + item.externalCategoryId
                )
              "
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
