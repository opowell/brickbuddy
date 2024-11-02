<script setup lang="ts">
import type { UiItem } from '../constants';
defineProps({
  items: Array<UiItem>
})
defineEmits(['goHome', 'goItem'])
</script>

<template>
  <div>
    <button @click="$emit('goHome')">
      Home
    </button>
    <h4>Items</h4>
    <table>
      <thead>
        <tr>
          <th>Images</th>
          <th>Category</th>
          <th>Name</th>
          <th>Variants</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.itemId">
          <td><img v-if="item.variants.length" :src="`https:${item.variants[0].newThumb1Img}`"></td>
          <td>{{ item.categoryString }}</td>
          <td>
            <button @click="$emit('goItem', item)">
              {{ item.itemName }}
            </button>
          </td>
          <td>{{ item.variants.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>