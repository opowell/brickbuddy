<script setup lang="ts">
import { PropType } from 'vue';
import { InvItem, type UiInvItem } from '../types'
import { formatAmount, formatInteger, cheapestPrice, getScore } from '@/options/utils';
import PartVariantButton from '@/options/components/PartVariantButton.vue';
import StoreButton from '@/options/components/StoreButton.vue';
import { setCartQuantity } from '@/options/idb/carts';
import ColorButton from '@/options/components/ColorButton.vue';
import ConditionButton from '@/options/components/ConditionButton.vue';
import QuantityInput from '@/options/components/QuantityInput.vue';
import { liveObjectCache } from '../idb/idb';

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
const search = ref()
onMounted(async () => {
  search.value = await liveObjectCache.getActiveSearch()
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
    return Number.parseFloat(a.price) - Number.parseFloat(b.price)
    // return (
    //   (typeof a.price === 'number' ? a.price : Number.parseInt(a.price)) -
    //   (typeof b.price === 'number' ? b.price : Number.parseInt(b.price))
    // )
  })
})

const viewedItems = computed<StoreItemsTableInvItem[] | undefined>(() => {
  if (!search.value) {
    return
  }
  const out = sortedItems.value.map(i => {
    return {
      ...i
    }
  })
  const out2: StoreItemsTableInvItem[] = []
  for (let i = 0; i < out.length; i++) {
    const item = out[i]
    let priceScoreString = getScore(sortedItems.value, search.value.priceScoreQuantity, item.price, false, costOfCheapest.value)
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
const selectQuantity = ref<number | undefined>()
const selectPrice = ref<number | undefined>()
const selectPriceScore = ref<number | undefined>()
function quantitySelect() {
  console.log('quantitySelect')
  if (!viewedItems.value) {
    return
  }
  if (!selectQuantity.value) {
    return
  }
  let total = 0
  for (let i=0; i<viewedItems.value.length; i++) {
    const item = viewedItems.value[i]
    const newQuantity = Math.min(item.quantity, selectQuantity.value - total)
    const input = cartInputs.value.get(item.storeId + item.invId)
    if (!input) {
      continue
    }
    input.setNewQ(newQuantity)
    total += newQuantity
    if (total >= selectQuantity.value) {
      break
    }
  }
}
function priceSelect() {
  console.log('priceSelect')
  if (!viewedItems.value) {
    return
  }
  if (!selectPrice.value) {
    return
  }
  for (let i=0; i<viewedItems.value.length; i++) {
    const item = viewedItems.value[i]
    if (Number.parseFloat(item.price) > selectPrice.value) {
      break
    }
    const input = cartInputs.value.get(item.storeId + item.invId)
    if (!input) {
      continue
    }
    input.setNewQ(item.quantity)
  }
}
function priceScoreSelect() {
  if (!viewedItems.value) {
    return
  }
  if (selectPriceScore.value === undefined) {
    return
  }
  for (let i=0; i<viewedItems.value.length; i++) {
    const item = viewedItems.value[i]
    if (Number.parseFloat(item.priceScore) > selectPriceScore.value) {
      break
    }
    const input = cartInputs.value.get(item.storeId + item.invId)
    if (!input) {
      continue
    }
    input.setNewQ(item.quantity)
  }
}

const cartInputs = ref(new Map<string, typeof QuantityInput>())
function setAllCarts() {
  if (!viewedItems.value) {
    return
  }
  for (let i=0; i<viewedItems.value.length; i++) {
    const item = viewedItems.value[i]
    const input = cartInputs.value.get(item.storeId + item.invId)
    if (!input) {
      continue
    }
    updateCartQuantity(item, input.newQ)
  }
}
function resetAllCarts() {
  if (!viewedItems.value) {
    return
  }
  for (let i=0; i<viewedItems.value.length; i++) {
    const item = viewedItems.value[i]
    const input = cartInputs.value.get(item.storeId + item.invId)
    if (!input) {
      continue
    }
    input.setNewQ(item.cartQuantity)
  }
}
</script>

<template>
  <h4 v-if="items && search">Store items ({{ items.length }})</h4>
  <div>
    <div>
      Quantity: <input type="number" v-model="selectQuantity" />
      <button @click="quantitySelect" :disabled="selectQuantity === undefined">
        Select
      </button>
    </div>
    <div>
      Price: <input type="number" v-model="selectPrice" step="0.01" />
      <button @click="priceSelect" :disabled="selectPrice === undefined">Select</button>
    </div>
    <div>
      Price score: <input type="number" v-model="selectPriceScore" step="0.01" />
      <button @click="priceScoreSelect" :disabled="selectPriceScore === undefined">
        Select
      </button>
    </div>
  </div>
  <div>
    All carts: <button @click="setAllCarts">Set</button>
    <button @click="resetAllCarts">Reset</button>
  </div>
  <table>
    <thead>
      <tr>
        <th v-if="!hideVariant">Variant</th>
        <th>Store</th>
        <th v-if="showColor">Color</th>
        <th v-if="search && search.conditions?.excluded.length < 1">Condition</th>
        <th>Price</th>
        <th>Price Score</th>
        <th>Quantity</th>
        <th>Cart</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(invItem, index) in viewedItems" :key="index">
        <PartVariantButton
          v-if="!hideVariant"
          :part="invItem.item"
          :variant="invItem.variant"
        >
          <img v-if="invItem.variant" :src="invItem.variant.image" />
        </PartVariantButton>
        <td>
          <StoreButton :store="invItem.store" />
        </td>
        <td v-if="showColor"><ColorButton :color="invItem.variant.color" /></td>
        <td v-if="search && search.conditions.excluded.length < 1">
          <ConditionButton :condition="invItem.condition" />
        </td>
        <td>{{ formatAmount(invItem.price) }}</td>
        <td>{{ invItem.priceScore }}</td>
        <td>{{ formatInteger(invItem.quantity) }}</td>
        <td>
          <QuantityInput
            :ref="(el) => cartInputs.set(invItem.storeId + invItem.invId, el)"
            :current="invItem.cartQuantity"
            :max="invItem.quantity"
            @update-quantity="updateCartQuantity(invItem, $event)"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>
