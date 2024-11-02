<script setup lang="ts">
import type { UiInvItem } from '../constants';
defineProps({
  store: Object
})
defineEmits(['goHome', 'goStores', 'goItem', 'startFetching', 'stopFetching'])

function getImageSrc(invItem: UiInvItem) {
  const variant = invItem.item.variants.find(v => v.colorId === invItem.color)
  if (!variant) {
    return
  }
  return `https:${variant.newThumb1Img}`
}
</script>

<template>
  <div v-if="store">
    <button @click="$emit('goHome')">
      Home
    </button>
    <button @click="$emit('goStores')">
      Stores
    </button>
    <h4>{{ store.name }}</h4>
    <h4>Inventory</h4>
    <button @click="$emit('startFetching')">
      Start fetching
    </button>
    <button @click="$emit('stopFetching')">
      Stop fetching
    </button>
    <h4>InvItems</h4>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Name</th>
          <th>Color</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in store.items" :key="item.invId">
          <td><img :src="getImageSrc(item)"></td>
          <td>
            <button
              @click="$emit('goItem', item.item)"
            >
              {{ item.item.itemName }}
            </button>
          </td>
          <td>{{ item.colorName }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.price }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>