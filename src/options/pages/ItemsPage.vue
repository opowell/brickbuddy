<script setup lang="ts">
import type { UiItem } from '../constants';
defineProps({
  items: Array<UiItem>
})
defineEmits(['goHome', 'goItem'])
</script>

<template>
  <div v-if="items">
    <button @click="$emit('goHome')">
      Home
    </button>
    <h4>Items ({{ items.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Images</th>
          <th>Id</th>
          <th>Name</th>
          <th>Category</th>
          <th>Variants</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.itemId">
          <td><img v-if="item.variants.length" :src="item.variants[0].image"></td>
          <td>{{ item.itemId }}</td>
          <td>
            <button @click="$emit('goItem', item)">
              {{ item.itemName }}
            </button>
          </td>
          <td>{{ item.categoryString }}</td>
          <td>{{ item.variants.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>