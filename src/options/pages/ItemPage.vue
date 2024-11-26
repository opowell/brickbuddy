<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import PartsButton from '../components/PartsButton.vue';
import PartVariantButton from '../components/PartVariantButton.vue';
import { getPartPagePart } from '../idb/idb';
import type { InvItem, PartPagePart, PartPageVariant, PartPageVariantInvItem, UiInvItem, UiItem, UiItemVariant } from '../types'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import CategoryButton from '../components/CategoryButton.vue';
import { formatInteger } from '../utils';
import ActiveCartButton from '../components/ActiveCartButton.vue';
interface VariantWithPriceQuantity extends PartPageVariant {
  price: number
  maxPrice: number
  quantity: number
}
import { useRoute } from 'vue-router'
import ColorButton from '../components/ColorButton.vue';
const route = useRoute()

const item = ref<PartPagePart | undefined>(undefined)
onMounted(async () => {
  item.value = await getPartPagePart(route.params.id)
})
const maxPrice = ref<number | undefined>(Number.POSITIVE_INFINITY)
const minQuantity = ref(0)
const variants = computed<VariantWithPriceQuantity[]>(() => {
  if (!item.value) {
    return []
  }
  return item.value.variants.map((variant: PartPageVariant) => {
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
  }).filter((variant: VariantWithPriceQuantity) => {
    return variant.price < Number.POSITIVE_INFINITY && variant.quantity > 0
  })
    .sort((a: VariantWithPriceQuantity, b: VariantWithPriceQuantity) => a.price - b.price)
})
const condition = ref<string>('New')
const invItems = computed<PartPageVariantInvItem[] | undefined>(() => {
  return item.value?.variants.flatMap(variant => {
    return variant.invItems.map(invItem => {
      return {
        ...invItem,
        variant
      }
    })
  })
})
const cartButton = ref<typeof ActiveCartButton | undefined>(undefined)
function refreshCartButton() {
  if (cartButton.value) {
    cartButton.value.refresh()
  }
}
function setCartQuantity({ invItem, newQuantity }: { invItem: InvItem, newQuantity: number}) {
  const originalItem = item.value?.variants.flatMap(v => v.invItems).find(i => i.invId === invItem.invId && i.storeId === invItem.storeId)
  if (!originalItem) {
    return
  }
  originalItem.cartQuantity = newQuantity
}
</script>

<template>
  <div v-if="!item">Loading...</div>
  <div v-else>
    <HomeButton />
    <PartsButton />
    <ActiveSearchButton />
    <ActiveCartButton ref="cartButton" />
    <h4>{{ item.itemName }} ({{ item.itemId }})</h4>
    <div>Bricklink: {{ item.brickLinkName }} ({{ item.brickLinkIds?.join(',') }})</div>
    <div>Lego: {{ item.legoName }} ({{ item.legoPartIds?.join(',') }})</div>
    <div>Min quantity:<input v-model="minQuantity" type="number"></div>
    <div>Min quantity:<input v-model="minQuantity" type="number"></div>
    <div>Max price:<input v-model="maxPrice" type="number"></div>
    <div>Category: <CategoryButton :category="item.category" /></div>
    <div>BrickLink Categories: <CategoryButton :category="item.category" /></div>
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
    <h4>Variants ({{ variants.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Color</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Inv. Items</th>
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
            <ColorButton :color="variant.color" />
          </td>
          <td v-if="variant.price === variant.maxPrice">{{ variant.price }}</td>
          <td v-else>{{ variant.price }}&nbsp;-&nbsp;{{ variant.maxPrice }}</td>
          <td>{{ formatInteger(variant.quantity) }}</td>
          <td>{{ formatInteger(variant.invItems.length) }}</td>
        </tr>
      </tbody>
    </table>
    <StoreItemsTable
      v-if="invItems"
      :items="invItems"
      show-color
      @set-cart-quantity="setCartQuantity"
      @refresh-cart-button="refreshCartButton"
    />
  </div>
</template>