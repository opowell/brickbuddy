<script setup lang="ts">
import { PropType } from 'vue';
import { ActiveSearch, type UiInvItem } from '../options/types'

import PartVariantButton from '@/options/components/PartVariantButton.vue';
import StoreButton from '@/options/components/StoreButton.vue';
import { getActiveSearch } from '@/options/idb/idb';
import ColorButton from '@/options/components/ColorButton.vue';
const { items, showColor = false } = defineProps({
  showColor: Boolean,
  items: Object as PropType<UiInvItem[]>,
})

interface StoreItemsTableInvItem extends UiInvItem {
  priceScore: number
}
const search = ref<ActiveSearch | undefined>(undefined)
onMounted(async () => {
  search.value = getActiveSearch()
})

function formatAmount(x: number) {
  if (x === 0) {
    return 0
  }
  if (x < 1) {
    return x.toFixed(2)
  }
  if (x < 1000) {
    return x.toFixed(1)
  }
  if (x < 1000000) {
    return (x/1000).toFixed(1) + 'k'
  }
  return (x/1000000).toFixed(1) + 'm'
}
const sortedItems = computed<StoreItemsTableInvItem[]>(() => {
  if (!items) {
    return []
  }
  const out = items
    .sort((a: UiInvItem, b: UiInvItem) => a.price - b.price)
    .map(i => {
      return {
        ...i
      }
    })
  const prevItems = []
  const out2: StoreItemsTableInvItem[] = []
  for (let i = 0; i < out.length; i++) {
    let priceScore = 0
    prevItems.forEach(item => {
      priceScore += item.quantity * (out[i].price - item.price)
    })
    out2.push({
      ...out[i],
      priceScore: priceScore / out[i].price
    })
    prevItems.push(out[i])
  }
  return out2
})
</script>

<template>
  <h4>Store items</h4>
  <table>
    <thead>
      <tr>
        <th>Variant</th>
        <th>Store</th>
        <th v-if="showColor">Color</th>
        <th v-if="search && search.conditions.ids.length < 1">Condition</th>
        <th>Price</th>
        <th>Price Score</th>
        <th>Quantity</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(invItem, index) in sortedItems" :key="index">
        <PartVariantButton :part="invItem.item" :variant="invItem.variant">
          <img v-if="invItem.variant" :src="invItem.variant.image">
        </PartVariantButton>
        <td>
          <StoreButton :store="invItem.store" />
        </td>
        <td v-if="showColor"><ColorButton :color="invItem.variant.color" /></td>
        <td v-if="search && search.conditions.ids.length < 1">{{ invItem.condition }}</td>
        <td>{{ invItem.price }}</td>
        <td>{{ formatAmount(invItem.priceScore) }}</td>
        <td>{{ invItem.quantity }}</td>
      </tr>
    </tbody>
  </table>
</template>
