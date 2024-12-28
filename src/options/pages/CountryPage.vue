<script setup lang="ts">
import { SearchFilter, StoreType, type StoresPageStore } from '../types';
import StoreButton from '../components/StoreButton.vue';
import { getCountryPageStores, getStoresPageStores } from '../idb/storeMethods'
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
  const route = useRoute();
import { useRouter } from "vue-router";
const router = useRouter();

const id = ref()
onMounted(async () => {
  id.value = route.params.id
  stores.value = await getCountryPageStores()
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
import { put } from '../idb/db';
import STORES from '../idb/stores';

async function importStores() {
  return await importBrickLinkStores(liveObjectCache.db)
}

const filteredStores = computed(() => {
  if (!stores.value) {
    return
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
  if (!totalCurrentFetchIndex.value) {
    return
  }
  if (!totalMaxFetchIndex.value) {
    return
  }
  return formatAmount(100 * totalCurrentFetchIndex.value / totalMaxFetchIndex.value)
})
const totalCurrentFetchIndex = computed(() => {
  let sum = 0
  if (!filteredStores.value) {
    return 0
  }
  filteredStores.value.forEach(store => {
    sum += store.fetchPageIndex
  })
  return sum
})
const totalMaxFetchIndex = computed(() => {
  let sum = 0
  if (!filteredStores.value) {
    return 1
  }
  filteredStores.value.forEach(store => {
    sum += store.fetchMaxPageIndex
  })
  return sum
})
const totalItems = computed(() => {
  if (!filteredStores.value) {
    return 0
  }
  let sum = 0
  filteredStores.value.forEach(store => {
    sum += store.numInvItems
  })
  return formatInteger(sum)
})

async function includeAll() {
  return await filterAll(false)
}
async function excludeAll() {
  return await filterAll(true)
}
async function filterAll(isExcluded: boolean) {
  if (!filteredStores.value) {
    return
  }
  for (let i=0; i<filteredStores.value.length; i++) {
    const store = filteredStores.value[i]
    await filter(store, isExcluded)
  }
}

import { useFilterStore } from '@/composables/filterStore';
const includedMap = ref(new Map<string, boolean>())
const excludedMap = ref(new Map<string, boolean>())
const { include, exclude, filter, clear } = useFilterStore(includedMap.value, excludedMap.value)
</script>

<template>
  <div>
    <HomeButton />
    <h3>Country: {{ id }}</h3>
    <h4 v-if="filteredStores && stores">
      Stores ({{ filteredStores.length }} / {{ stores.length }})
    </h4>
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
      <input v-model="numMinFetchPagesTotal" type="number" /> -
      <input v-model="numMaxFetchPagesTotal" type="number" />
    </div>
    <table v-if="filteredStores">
      <thead>
        <tr>
          <th>Id</th>
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
          <td>-----</td>
          <td>-----</td>
          <td>TOTAL</td>
          <td>{{ totalItems }}</td>
          <td>
            {{ formatInteger(totalCurrentFetchIndex) }} /
            {{ formatInteger(totalMaxFetchIndex) }}
          </td>
          <td>{{ avgFetchPercent }}</td>
          <td></td>
          <td><FilterButtons @include="includeAll" @exclude="excludeAll" /></td>
        </tr>
        <tr v-for="store in filteredStores" :key="store.id">
          <td>{{ store.id }}</td>
          <td>{{ store.type === StoreType.BrickLink ? "BrickLink" : "Lego" }}</td>
          <td>
            <StoreButton :store="store" />
          </td>
          <td>
            {{ formatInteger(store.numInvItems) }}
          </td>
          <td>{{ store.fetchPageIndex }} / {{ store.fetchMaxPageIndex }}</td>
          <td>
            {{ store.fetchPercent.toFixed(1) }}
          </td>
          <td>
            {{ store.lastScraped.toISOString() }}
          </td>
          <td>
            <FilterButtons
              :excluded="excludedMap.get(store.id)"
              :included="includedMap.get(store.id)"
              @exclude="exclude(store)"
              @include="include(store)"
              @clear="clear(store)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
