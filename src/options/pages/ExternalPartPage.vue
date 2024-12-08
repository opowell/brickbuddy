<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import PartsButton from '../components/PartsButton.vue';
import PartVariantButton from '../components/PartVariantButton.vue';
import { externalPartPageExternalPartMap, getPartPagePart } from '../idb/parts';
import type { CachedInvItem, CachedItemVariant, InvItem, PartPagePart, PartPageVariant, PartPageVariantInvItem, UiInvItem, UiItem, UiItemVariant } from '../types'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import CategoryButton from '../components/CategoryButton.vue';
import { formatInteger } from '../utils';
import ActiveCartButton from '../components/ActiveCartButton.vue';
import StoreItemsTable from '../components/StoreItemsTable.vue';
import ExternalPartButton from '../components/ExternalPartButton.vue';
interface VariantWithPriceQuantity extends PartPageVariant {
  price: number
  maxPrice: number
  quantity: number
}
import { useRoute } from 'vue-router'
import ColorButton from '../components/ColorButton.vue';
const route = useRoute()

const item = computed(() => {
  return externalPartPageExternalPartMap.value.get(route.params.type + route.params.id)
})
const maxPrice = ref<number | undefined>(Number.POSITIVE_INFINITY)
const minQuantity = ref(0)
const variants = computed<VariantWithPriceQuantity[]>(() => {
  if (!item.value) {
    return []
  }
  const variantsWithPQ: VariantWithPriceQuantity[] = item.value.variants.map((variant: CachedItemVariant) => {
    let price = Number.POSITIVE_INFINITY
    let varMaxPrice = 0
    let quantity = 0
    const matchingInvItems = variant.externalPart.invItems.filter(iv => iv.colorId === variant.colorId)
    matchingInvItems.forEach((invItem: CachedInvItem) => {
      if (condition.value !== 'Any' && invItem.condition !== condition.value) {
        return
      }
      const priceNumber = Number.parseFloat(invItem.price)
      if (maxPrice.value && maxPrice.value !== 0 && maxPrice.value < priceNumber) {
        return
      }
      if (invItem.quantity >= minQuantity.value) {
        if (priceNumber < price) {
          price = priceNumber
        }
        if (priceNumber > varMaxPrice) {
          varMaxPrice = priceNumber
        }
      }
      if (!maxPrice.value || priceNumber <= maxPrice.value) {
        quantity += invItem.quantity
      }
    })
    console.log('add', quantity, variant.colorId)
    return {
      ...variant,
      price,
      maxPrice: varMaxPrice,
      quantity,
      invItems: matchingInvItems,
    }
  })
  return variantsWithPQ.filter((variant: VariantWithPriceQuantity) => {
    return variant.price < Number.POSITIVE_INFINITY && variant.quantity > 0
  })
    .sort((a: VariantWithPriceQuantity, b: VariantWithPriceQuantity) => a.price - b.price)
})
const condition = ref<string>('New')
const invItems = computed<PartPageVariantInvItem[] | undefined>(() => {
  if (!item.value) {
    return []
  }
  return item.value.variants.flatMap(variant => {
    return variant.externalPart.invItems.filter(ii => ii.colorId === variant.colorId).map(invItem => {
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
  const originalItem = item.value?.variants.flatMap(v => v.externalPart.invItems).find(i => i.invId === invItem.invId && i.storeId === invItem.storeId)
  if (!originalItem) {
    return
  }
  originalItem.cartQuantity = newQuantity
}
</script>

<template>
  <div v-if="!item">Loading...</div>
  <div v-else>
    <p>
      <ActiveSearchButton />
      <ActiveCartButton ref="cartButton" />
    </p>
    <HomeButton />
    <PartsButton />
    <h4>External Item {{ item.name }}</h4>
    <div>Item: {{ item.part?.itemId }}</div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(externalPart, index) in item.externalParts" :key="index">
          <td>
            <ExternalPartButton :part="externalPart" />
          </td>
        </tr>
      </tbody>
    </table>
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