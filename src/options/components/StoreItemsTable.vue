<script setup lang="ts">
import { PropType } from 'vue';
import { ActiveSearch, type UiInvItem } from '../types'
import { formatAmount, formatInteger, formatFloat, cheapestPrice } from '@/options/utils';
import PartVariantButton from '@/options/components/PartVariantButton.vue';
import StoreButton from '@/options/components/StoreButton.vue';
import { getActiveSearch } from '@/options/idb/searches';
import { setCartQuantity } from '@/options/idb/carts';
import ColorButton from '@/options/components/ColorButton.vue';
import ConditionButton from '@/options/components/ConditionButton.vue';
import * as math from 'mathjs'
import QuantityInput from '@/options/components/QuantityInput.vue';

const { hideVariant = false, items, showColor = false } = defineProps({
  hideVariant: Boolean,
  showColor: Boolean,
  items: Object as PropType<StoreItemsTableInvItem[]>,
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
  return cheapestPrice(sortedItems.value, search.value.priceScoreQuantity)
})

const sortedItems = computed<StoreItemsTableInvItem[]>(() => {
  if (!items) {
    return []
  }
  return items.sort((a: StoreItemsTableInvItem, b: StoreItemsTableInvItem) => {
    return (
      (typeof a.price === 'number' ? a.price : Number.parseInt(a.price)) -
      (typeof b.price === 'number' ? b.price : Number.parseInt(b.price))
    )
  })
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
    let priceScore: math.MathType
    let priceScoreString = ''
    if (search.value && costOfCheapest.value) {
      priceScore = math.divide(math.bignumber(item.price), math.bignumber(costOfCheapest.value))
      const percent = math.multiply(100, math.subtract(priceScore, 1))
      let sign = ''
      if (math.larger(percent, 0)) {
        sign = '+'
      }
      priceScoreString = sign + percent.toString() + '%'
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
  const response = await setCartQuantity(item.store, item.invId, item.price, newQuantity)
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
