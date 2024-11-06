<script setup lang="ts">
import type { UiStore } from '../types';
defineProps({
  stores: Array<UiStore>,
  scrapingOn: Boolean
})
const emits = defineEmits(['setScraping', 'goHome', 'goStore', 'add'])
const newStoreId = ref('')
const newStoreName = ref('')

function add() {
  emits('add', {
    sId: newStoreId.value,
    name: newStoreName.value
  })
}
const stores2 = ref<UiStore[]>()
onMounted(async () => {
  // stores2.value = await fetchStores(search.value)
})
const search = ref('')
</script>

<template>
  <div>
    <button @click="$emit('goHome')">
      Home
    </button>
    <h4>Stores</h4>
    <h4>Scraping: {{ scrapingOn ? 'On' : 'Off' }}</h4>
    <div>
      <button @click="$emit('setScraping', true)" :disabled="scrapingOn">Start</button>
      <button @click="$emit('setScraping', false)" :disabled="!scrapingOn">Stop</button>
    </div>
    <div>Search:<input v-model="search"></div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Inventory</th>
          <th>Fetch Index</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="store in stores" :key="store.sId">
          <td>
            <button @click="$emit('goStore', store)">
              {{ store.name }}
            </button>
          </td>
          <td>
            {{ store.items.length }}
          </td>
          <td>
            {{ store.fetchPageIndex }} / {{ store.fetchMaxPageIndex }}
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