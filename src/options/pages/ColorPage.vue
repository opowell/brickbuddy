<script setup lang="ts">
import ColorsButton from '../components/ColorsButton.vue';
import HomeButton from '../components/HomeButton.vue';
import PartButton from '../components/PartButton.vue';
import { getUiColor } from '../idb/idb'

import { useRoute } from 'vue-router'
import { ColorPageColor, ColorPageInvItem } from '../types';
import StoreButton from '../components/StoreButton.vue';
const route = useRoute()
const color = ref<ColorPageColor | undefined>(undefined)
onMounted(async () => {
  color.value = await getUiColor(route.params.id)
})
function getImageSrc(invItem: ColorPageInvItem) {
  const variant = invItem.variant
  if (!variant) {
    return
  }
  return variant.image
}
</script>

<template>
  <div v-if="color">
    <HomeButton />
    <ColorsButton />
    <h4>{{ color.name }}</h4>
    <div>Id: {{ color.id }}</div>
    <h4>Part variants</h4>
    <h4>Shop list items</h4>
    <h4>Inventory items {{ color.invItems?.length }}</h4>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Name</th>
          <th>Condition</th>
          <th>Store</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in color.invItems" :key="item.invId">
          <td><img
            :src="getImageSrc(item)"
            @click="goVariant(item)"
          ></td>
          <td>
            <PartButton :part="item.item" />
          </td>
          <td>{{ item.condition }}</td>
          <td><StoreButton :store="item.store" /></td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.store ? item.price*item.store.priceAdjustment/100 : item.price }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>