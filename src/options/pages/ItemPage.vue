<script setup lang="ts">
import type { UiInvItem, UiItemVariant } from '../types'
interface PartVariantWithPriceQuantity extends UiItemVariant {
  price: number
  quantity: number
}
const { item } = defineProps({
  item: Object
})
defineEmits(['goHome', 'goItems', 'goVariant', 'goColor'])
const maxPrice = ref(Number.POSITIVE_INFINITY)
const minQuantity = ref(0)
const variants = computed(() => {
  if (!item) {
    return
  }
  return item.variants.map((variant: UiItemVariant) => {
    let price = Number.POSITIVE_INFINITY
    let quantity = 0
    variant.invItems.forEach((invItem: UiInvItem) => {
      if (invItem.quantity >= minQuantity.value && (price === 0 || invItem.price < price)) {
        price = invItem.price
      }
      if (!maxPrice.value || invItem.price <= maxPrice.value) {
        quantity += invItem.quantity
      }
    })
    return {
      ...variant,
      price,
      quantity
    }
  }).sort((a: PartVariantWithPriceQuantity, b: PartVariantWithPriceQuantity) => a.price - b.price)
})
</script>

<template>
  <div v-if="item">
    <button @click="$emit('goHome')">
      Home
    </button>
    <button @click="$emit('goItems')">
      Parts
    </button>
    <h4>{{ item.itemName }}</h4>
    <div>Min quantity:<input v-model="minQuantity" type="number"></div>
    <div>Max price:<input v-model="maxPrice" type="number"></div>
    <div>Category: {{ item.categoryString }}</div>
    <h4>Variants</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Color</th>
          <th>Price</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(variant, index) in variants" :key="index">
          <td><img :src="variant.image"></td>
          <td>
            <button @click="$emit('goVariant', variant)">
              {{ item.itemName + ', ' + variant.color.name }}
            </button>
          </td>
          <td>
            <button @click="$emit('goColor', variant.color)">
              {{ variant.color.name }}
            </button>
          </td>
          <td>{{ variant.price }}</td>
          <td>{{ variant.quantity }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>