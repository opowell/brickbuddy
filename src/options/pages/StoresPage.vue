<script setup lang="ts">
import type { UiStore } from '../types';
import StoreButton from '../components/StoreButton.vue';
import { getDbCreateInitialStores, stopFetching, startFetching, addNewStore, stores } from '../idb'
const newStoreId = ref('')
const newStoreName = ref('')
const scrapingOn = ref(true)
function setScraping(value: boolean) {
  if (value) {
    startFetching()
  } else {
    stopFetching()
  }
  scrapingOn.value = value
}

function add() {
  addNewStore({
    sId: newStoreId.value,
    name: newStoreName.value
  })
}
const stores2 = ref<UiStore[]>()
onMounted(async () => {
  // stores2.value = await fetchStores(search.value)
})
const search = ref('')
import HomeButton from '../components/HomeButton.vue';
</script>

<template>
  <div>
    <HomeButton />
    <h4>Stores</h4>
    <button @click="getDbCreateInitialStores">Load initial</button>
    <h4>Scraping: {{ scrapingOn ? 'On' : 'Off' }}</h4>
    <div>
      <button @click="setScraping(true)" :disabled="scrapingOn">Start</button>
      <button @click="setScraping(false)" :disabled="!scrapingOn">Stop</button>
    </div>
    <div>Search:<input v-model="search"></div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Inventory</th>
          <th>Fetch Index</th>
          <th>Last Scraped</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="store in stores" :key="store.sId">
          <td>
            <StoreButton :store="store" />
          </td>
          <td>
            {{ store.items.length }}
          </td>
          <td>
            {{ store.fetchPageIndex }} / {{ store.fetchMaxPageIndex }}
          </td>
          <td>
            {{ store.lastScraped.toISOString() }}
          </td>
        </tr>
      </tbody>
    </table>
    <h4>Add</h4>
    <div>Id:<input v-model="newStoreId" type="text"></div>
    <div>Name:<input v-model="newStoreName" type="text"></div>
    <button @click="add">
      Add new
    </button>
  </div>
</template>