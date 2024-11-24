<script setup lang="ts">
import { PropType } from 'vue';
import { ActiveSearch, type UiInvItem } from '../options/types'
import { formatAmount, formatInteger, formatFloat } from '@/options/utils';
import PartVariantButton from '@/options/components/PartVariantButton.vue';
import StoreButton from '@/options/components/StoreButton.vue';
import { getActiveSearch, setCartQuantity } from '@/options/idb/idb';
import ColorButton from '@/options/components/ColorButton.vue';
import ConditionButton from '@/options/components/ConditionButton.vue';
import * as math from 'mathjs'
import QuantityInput from '@/options/components/QuantityInput.vue';

const { hideVariant = false, items, showColor = false } = defineProps({
  hideVariant: Boolean,
  showColor: Boolean,
  items: Object as PropType<UiInvItem[]>,
})
const emits = defineEmits([
  'refreshCartButton',
  'setCartQuantity'
])

interface StoreItemsTableInvItem extends UiInvItem {
  cartQuantity: number | undefined;
  priceScore: string
}
const search = ref<ActiveSearch | undefined>(undefined)
onMounted(async () => {
  search.value = getActiveSearch()
})

const costOfCheapest = computed<number | undefined>(() => {
  if (!search.value) {
    return
  }
  const targetQ = search.value.priceScoreQuantity
  let cost = 0
  let quantity = 0
  for (let i = 0; i < sortedItems.value.length; i++) {
    const item = sortedItems.value[i]
    const toTake = Math.min(item.quantity, targetQ - quantity)
    quantity += toTake
    cost += math.number(math.multiply(math.bignumber(item.price), math.bignumber(toTake)))
    if (toTake >= targetQ) {
      break
    }
  }
  return cost / quantity
})

const sortedItems = computed<StoreItemsTableInvItem[]>(() => {
  if (!items) {
    return []
  }
  return items.sort((a: UiInvItem, b: UiInvItem) => a.price - b.price)
})

const viewedItems = computed<StoreItemsTableInvItem[]>(() => {
  const out = sortedItems.value.map(i => {
    return {
      ...i
    }
  })
  const out2: StoreItemsTableInvItem[] = []
  for (let i = 0; i < out.length; i++) {
    const item = out[i]
    let priceScore = 0
    let priceScoreString = ''
    if (search.value && costOfCheapest.value) {
      priceScore = math.number(math.divide(math.bignumber(item.price), math.bignumber(costOfCheapest.value)))
      const percent = math.number(math.multiply(100, math.number(math.subtract(priceScore, 1))))
      let sign = ''
      if (percent > 0) {
        sign = '+'
      }
      priceScoreString = sign + percent.toFixed(2) + '%'
    }
    out2.push({
      ...out[i],
      priceScore: priceScoreString,
    })
  }
  return out2
})
async function updateCartQuantity(item: StoreItemsTableInvItem, newQuantity: number) {
  if (!item.store) {
    return
  }
  const response = await setCartQuantity(item.store, item, newQuantity)
  if (response) {
    item.cartQuantity = newQuantity
    emits('setCartQuantity', { invItem: item, newQuantity })
  }
  emits('refreshCartButton')
}

</script>

<template>
  <h4>Store items</h4>
  <table>
    <thead>
      <tr>
        <th v-if="!hideVariant">Variant</th>
        <th>Store</th>
        <th v-if="showColor">Color</th>
        <th v-if="search && search.conditions.excluded.length < 1">Condition</th>
        <th>Price</th>
        <th>Price Score</th>
        <th>Quantity</th>
        <th>Cart</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(invItem, index) in viewedItems" :key="index">
        <PartVariantButton  v-if="!hideVariant" :part="invItem.item" :variant="invItem.variant">
          <img v-if="invItem.variant" :src="invItem.variant.image">
        </PartVariantButton>
        <td>
          <StoreButton :store="invItem.store" />
        </td>
        <td v-if="showColor"><ColorButton :color="invItem.variant.color" /></td>
        <td v-if="search && search.conditions.excluded.length < 1"><ConditionButton :condition="invItem.condition" /></td>
        <td>{{ formatAmount(invItem.price) }}</td>
        <td>{{ invItem.priceScore }}</td>
        <td>{{ formatInteger(invItem.quantity) }}</td>
        <td>
          <QuantityInput
            :current="invItem.cartQuantity"
            :max="invItem.quantity"
            @update-quantity="updateCartQuantity(invItem, $event)"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>
