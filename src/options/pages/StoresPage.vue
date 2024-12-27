<script setup lang="ts">
import { StoreType, type StoresPageStore } from '../types';
import StoreButton from '../components/StoreButton.vue';
import { getStoresPageStores } from '../idb/storeMethods'
import FilterButtons from '../components/FilterButtons.vue';
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
const numMinFetchPagesTotal: Ref<number | undefined> = ref()
const numMaxFetchPagesTotal: Ref<number | undefined> = ref()
import HomeButton from '../components/HomeButton.vue';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';
import { importBrickLinkStores, liveObjectCache } from '../idb/idb'
import { formatAmount, formatInteger } from '../utils';

async function importStores() {
  return await importBrickLinkStores(liveObjectCache.db)
}

const filteredStores = computed(() => {
  if (!stores.value) {
    return []
  }
  const minItems = numMinItems.value
  const minFetchPages = numMinFetchPagesTotal.value
  const maxFetchPages = numMaxFetchPagesTotal.value
  return stores.value.filter(store => {
    if (minItems && store.numInvItems < minItems) {
      return false
    }
    if (minFetchPages && store.fetchMaxPageIndex < minFetchPages) {
      return false
    }
    if (maxFetchPages && store.fetchMaxPageIndex > maxFetchPages) {
      return false
    }
    return true
  })
})

const avgFetchPercent = computed(() => {
  let sum = 0
  let count = 0
  filteredStores.value.forEach(store => {
    sum += store.fetchPercent
    count ++
  })
  return formatAmount(sum / count)
})
const totalItems = computed(() => {
  let sum = 0
  filteredStores.value.forEach(store => {
    sum += store.numInvItems
  })
  return formatInteger(sum)
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
    <div>
      Fetch pages total:
      <input v-model="numMinFetchPagesTotal" type="number" />
      <input v-model="numMaxFetchPagesTotal" type="number" />
    </div>
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
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td>{{ totalItems }}</td>
          <td></td>
          <td>{{ avgFetchPercent }}</td>
          <td></td>
          <td><FilterButtons /></td>
        </tr>
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
          <td>
            <FilterButtons />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
