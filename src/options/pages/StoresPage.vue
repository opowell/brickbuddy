<script setup lang="ts">
import { StoreType, type StoresPageStore } from '../types';
import StoreButton from '../components/StoreButton.vue';
import { getStoresPageStores } from '../idb/storeMethods'
import { stopFetching, startFetching, startFetchingStores, stopFetchingStores, fetchingStoreInventory, fetchingStores } from '../idb/scraping'
function startScrapingBLStores() {
  setBLStoreScraping(true)
}
function stopScrapingBLStores() {
  setBLStoreScraping(false)
}
function setBLStoreScraping(value: boolean) {
  if (value) {
    startFetchingStores()
  } else {
    stopFetchingStores()
  }
}
function setScraping(value: boolean) {
  if (value) {
    startFetching()
  } else {
    stopFetching()
  }
}
const stores = ref<StoresPageStore[] | undefined>()
onMounted(async () => {
  stores.value = await getStoresPageStores()
})

const search = ref('')
const numMinItems: Ref<number | undefined> = ref(100)
import HomeButton from '../components/HomeButton.vue';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';
import { importBrickLinkStores, liveObjectCache } from '../idb/idb'

async function importStores() {
  return await importBrickLinkStores(liveObjectCache.db)
}

const filteredStores = computed(() => {
  if (!stores.value) {
    return []
  }
  if (!numMinItems.value) {
    return stores.value
  }
  const min = numMinItems.value
  return stores.value.filter(store => store.numInvItems >= min)
})
</script>

<template>
  <div>
    <HomeButton />
    <ActiveCartButton />
    <ActiveSearchButton />
    <h4 v-if="stores">Stores ({{ filteredStores.length }} / {{ stores.length }})</h4>
    <h4>Scraping:</h4>
    <div><button @click="importStores">Import from BrickLink</button></div>
    <div>
      <span>BL stores: {{ fetchingStores ? "On" : "Off" }}</span>
      <button @click="startScrapingBLStores" :disabled="fetchingStores">Start</button>
      <button @click="stopScrapingBLStores" :disabled="!fetchingStores">Stop</button>
    </div>
    <div>
      <span>Inventory: {{ fetchingStoreInventory ? "On" : "Off" }}</span>
      <button @click="setScraping(true)" :disabled="fetchingStoreInventory">Start</button>
      <button @click="setScraping(false)" :disabled="!fetchingStoreInventory">
        Stop
      </button>
    </div>
    <div>Search:<input v-model="search" /></div>
    <div>Inventory (min.):<input v-model="numMinItems" type="number" /></div>
    <table>
      <thead>
        <tr>
          <th>Country</th>
          <th>Type</th>
          <th>Name</th>
          <th>Inventory</th>
          <th>Fetch Index</th>
          <th>Fetch %</th>
          <th>Last Scraped</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="store in filteredStores" :key="store.id">
          <td>
            <button>{{ store.countryId }}</button>
          </td>
          <td>{{ store.type === StoreType.BrickLink ? "BrickLink" : "Lego" }}</td>
          <td>
            <StoreButton :store="store" />
          </td>
          <td>
            {{ store.numInvItems }}
          </td>
          <td>{{ store.fetchPageIndex }} / {{ store.fetchMaxPageIndex }}</td>
          <td>
            {{ store.fetchPercent.toFixed(1) }}
          </td>
          <td>
            {{ store.lastScraped.toISOString() }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
