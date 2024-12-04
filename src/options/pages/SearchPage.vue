<script setup lang="ts">
import type { UiShopList, UiStore } from '../types'
const { search, lists, stores } = defineProps({
  search: Object,
  lists: Array<UiShopList>,
  stores: Array<UiStore>
})
const emits = defineEmits([
  'goHome',
  'goSearches',
  'setList',
  'addStore',
  'goStore',
  'removeStore'
])

function analyse() {
  console.log('analyse')
}

const listId = ref()
const addStoreId = ref()
watch(() => search, () => {
  if (!search) {
    return
  }
  listId.value = search.shoppingListId
}, { deep: true, immediate: true})
watch(listId, () => {
  emits('setList', listId.value)
})
</script>

<template>
  <div v-if="search">
    <button @click="$emit('goHome')">
      Home
    </button>
    <button @click="$emit('goSearches')">
      Searches
    </button>
    <h4>Search</h4>
    <button @click="analyse">
      Analyse
    </button>
    <div>
      List:<select v-model="listId">
        <option
          v-for="list in lists"
          :key="list.id"
          :value="list.id"
        >
          {{ list.name }}
        </option>
      </select>
    </div>
    <div>
      Stores:
      <table>
        <thead>
          <tr>
            <th />
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="store in search.stores" :key="store.id">
            <td>
              <button @click="$emit('removeStore', store)">
                x
              </button>
            </td>
            <td>
              <button @click="$emit('goStore', store)">
                {{ store.name }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <select v-model="addStoreId">
        <option
          v-for="store in stores"
          :key="store.id"
          :value="store.id"
        >
          {{ store.name }}
        </option>
      </select>
      <button @click="$emit('addStore', addStoreId)">
        Add
      </button>
    </div>
    <table v-if="search.shopList">
      <thead>
        <tr>
          <th />
          <th v-for="store in search.stores" :key="store.id">
            {{ store.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in search.shopList.items" :key="item.itemId">
          <td>
            {{ item.minQuantity }}-{{ item.maxQuantity }}x {{ item.itemId }} / {{ item.condition }} / {{ item.colors }} - EURc {{ item.maxPrice }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>