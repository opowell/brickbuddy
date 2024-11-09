<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import StoresButton from '../components/StoresButton.vue';
import type { UiInvItem } from '../types';
import { useRoute } from 'vue-router'
import { getUiStore } from '../idb';
import PartButton from '../components/PartButton.vue';
const route = useRoute()
const store = ref<UiStore | undefined>(undefined)
onMounted(async () => {
  store.value = await getUiStore(route.params.id - 0)
})

function getImageSrc(invItem: UiInvItem) {
  const variant = getVariant(invItem)
  if (!variant) {
    return
  }
  return variant.image
}
function goVariant(invItem: UiInvItem) {

}
function getVariant(invItem: UiInvItem) {
  return invItem.item.variants.find(v => v.colorId === invItem.color)
}
// URL for shipping terms:
// https://store.bricklink.com/ajax/clone/store/policy.ajax?sid=2066952

// URL for cart, includes weights:
// https://store.bricklink.com/ajax/clone/cart/list.ajax?sid=2066952&sum=0&_=1730928837742
</script>


<template>
  <div v-if="store">
    <HomeButton />
    <StoresButton />
    <h4>{{ store.name }}</h4>
    <div>Fetch index: {{ store.fetchPageIndex }} / {{ store.fetchMaxPageIndex }}</div>
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
            @click="goVariant(item)"
          ></td>
          <td>
            <PartButton :part="item.item" />
          </td>
          <td><button @click="$emit('goColor', { id: item.color, name: item.colorName })">{{ item.colorName }}</button></td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.price }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>