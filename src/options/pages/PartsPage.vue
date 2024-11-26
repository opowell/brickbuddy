<script setup lang="ts">
import { getPartsPageParts, startPartScraping, stopPartScrapingFn, importRbPartsToMemory } from '../idb/idb';
import type { PartsPagePart, UiItem } from '../types';
import PartButton from '../components/PartButton.vue';
const search = ref('')
const items = ref<PartsPagePart[] | undefined>(undefined)
onMounted(async () => {
  items.value = await getPartsPageParts()
})
const filteredParts = computed(() => {
  if (!items.value) {
    return []
  }
  return items.value.filter((item: PartsPagePart) => item.itemName.includes(search.value))
})
import HomeButton from '../components/HomeButton.vue'
import CategoryButton from '../components/CategoryButton.vue';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import NameIdLabel from '../components/NameIdLabel.vue';
import QuantityInput from '../components/QuantityInput.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';
</script>

<template>
  <div v-if="!items">
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
          <th>BrickLink</th>
          <th>Lego</th>
          <th>List</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredParts" :key="item.itemId">
          <td><img v-if="item.variants.length" :src="item.variants[0].image"></td>
          <td>
            <PartButton :part="item" />
          </td>
          <td><CategoryButton :category="item.category" /></td>
          <td>{{ item.variants.length }}</td>
          <td><NameIdLabel :id="item.brickLinkIds?.join(', ')" /></td>
          <td><NameIdLabel :id="item.legoPartIds?.join(', ')" /></td>
          <td><QuantityInput :current="0" :max="1000" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>