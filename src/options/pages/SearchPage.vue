<script setup lang="ts">
import type { UiShopList } from '../constants'
defineProps({
  search: Object
})
defineEmits(['goHome', 'goSearches'])

function analyse() {
  console.log('analyse')
}

</script>

<template>
  <div>
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
    <table>
      <thead>
        <tr>
          <th />
          <th v-for="store in search.stores" :key="store.sId">
            {{ store.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in search.shopList.items" :key="`${item.shopListId }-${ item.itemId}`">
          <td>
            {{ item.minQuantity }}-{{ item.maxQuantity }}x {{ item.itemId }} / {{ item.condition }} / {{ item.colors }} - EURc {{ item.maxPrice }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>