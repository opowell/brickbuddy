<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import PartsButton from '../components/PartsButton.vue';
import PartVariantButton from '../components/PartVariantButton.vue';
import { getPartPagePart } from '../idb/idb';
import type { UiInvItem, UiItem, UiItemVariant } from '../types'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
interface PartVariantWithPriceQuantity extends UiItemVariant {
  price: number
  maxPrice: number
  quantity: number
}
import { useRoute } from 'vue-router'
const route = useRoute()

const item = ref<UiItem | undefined>(undefined)
onMounted(async () => {
  item.value = await getPartPagePart(route.params.id)
})
const maxPrice = ref<number | undefined>(Number.POSITIVE_INFINITY)
const minQuantity = ref(0)
const variants = computed<PartVariantWithPriceQuantity[]>(() => {
  if (!item.value) {
    return []
  }
  return item.value.variants.map((variant: UiItemVariant) => {
    let price = Number.POSITIVE_INFINITY
    let varMaxPrice = 0
    let quantity = 0
    variant.invItems.forEach((invItem: UiInvItem) => {
      if (condition.value !== 'Any' && invItem.condition !== condition.value) {
        return
      }
      if (maxPrice.value && maxPrice.value !== 0 && maxPrice.value < invItem.price) {
        return
      }
      if (invItem.quantity >= minQuantity.value) {
        if (invItem.price < price) {
          price = invItem.price
        }
        if (invItem.price > varMaxPrice) {
          varMaxPrice = invItem.price
        }
      }
      if (!maxPrice.value || invItem.price <= maxPrice.value) {
        quantity += invItem.quantity
      }
    })
    return {
      ...variant,
      price,
      maxPrice: varMaxPrice,
      quantity
    }
  }).filter((variant: PartVariantWithPriceQuantity) => {
    return variant.price < Number.POSITIVE_INFINITY && variant.quantity > 0
  })
    .sort((a: PartVariantWithPriceQuantity, b: PartVariantWithPriceQuantity) => a.price - b.price)
})
const condition = ref<string>('New')
const invItems = computed<UiInvItem[] | undefined>(() => {
  return item.value?.variants.flatMap(variant => {
    return variant.invItems.map(invItem => {
      return {
        ...invItem,
        variant
      }
    })
  })
})
</script>

<template>
  <div v-if="!item">Loading...</div>
  <div v-else>
    <HomeButton />
    <PartsButton />
    <ActiveSearchButton />
    <h4>{{ item.itemName }}</h4>
    <div>Min quantity:<input v-model="minQuantity" type="number"></div>
    <div>Max price:<input v-model="maxPrice" type="number"></div>
    <div>Category: {{ item.categoryString }}</div>
    <div>
      Condition:<select v-model="condition">
        <option value="New">
          New
        </option>
        <option value="Any">
          Any
        </option>
        <option value="Used">
          Used
        </option>
      </select>
    </div>
    <h4>Variants</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Color</th>
          <th>Price</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(variant, index) in variants" :key="index">
          <td>
            <PartVariantButton :part="item" :variant="variant">
              <img :src="variant.image">
            </PartVariantButton>
          </td>
          <td>
            <button @click="$emit('goColor', variant.color)">
              {{ variant.color?.name }}
            </button>
          </td>
          <td v-if="variant.price === variant.maxPrice">{{ variant.price }}</td>
          <td v-else>{{ variant.price }}&nbsp;-&nbsp;{{ variant.maxPrice }}</td>
          <td>{{ variant.quantity }}</td>
        </tr>
      </tbody>
    </table>
    <StoreItemsTable :items="invItems" show-color />
  </div>
</template>