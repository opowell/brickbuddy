<script setup lang="ts">
import type { UiInvItem } from '../types';
defineProps({
  fetching: Boolean,
  store: Object
})
defineEmits(['goHome', 'goStores', 'goItem', 'startFetching', 'stopFetching', 'goVariant', 'goColor'])

function getImageSrc(invItem: UiInvItem) {
  const variant = getVariant(invItem)
  if (!variant) {
    return
  }
  return variant.image
}
function getVariant(invItem: UiInvItem) {
  return invItem.item.variants.find(v => v.colorId === invItem.color)
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
    <h4>Fetch inventory</h4>
    <button
      :disabled="fetching"
      @click="$emit('startFetching')"
    >
      Start
    </button>
    <button
      :disabled="!fetching"
      @click="$emit('stopFetching')"
    >
      Stop
    </button>
    <h4>Inventory ({{ store.items.length }})</h4>
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
          <td><img
            :src="getImageSrc(item)"
            @click="$emit('goVariant', getVariant(item))"
          ></td>
          <td>
            <button
              @click="$emit('goItem', item.item)"
            >
              {{ item.item.itemName }}
            </button>
          </td>
          <td><button @click="$emit('goColor', { id: item.color, name: item.colorName })">{{ item.colorName }}</button></td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.price }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>