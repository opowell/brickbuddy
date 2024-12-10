<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import { formatAmount, formatInteger } from '../utils';

import { CartItem, CartPageCart, CartPageCartItem, Store } from '../types';
import { useRoute } from 'vue-router'
const route = useRoute()
const cart = ref<CartPageCart | undefined>(undefined)
const cartItems = ref<CartItem[] | undefined>(undefined)
const items = ref<CartPageCartItem[]>([])
onMounted(async () => {
  const db = await getDbConnection()
  const objectCache = new ObjectCache(db)
  cart.value = await getCartPageCart(db, route.params.id - 0)
  if (!cart.value) {
    return
  }

  cartItems.value = await getCartItems(db, cart.value)
  for (let i = 0; i < cartItems.value.length; i++) {
    const cartPageCartItem = await getCartPageCartItem(objectCache, cartItems.value[i])
    if (!cartPageCartItem) {
      continue
    }
    items.value.push(cartPageCartItem)
  }

})
import ExternalCategoryButton from '../components/ExternalCategoryButton.vue';
import ConditionButton from '../components/ConditionButton.vue';
import StoreButton from '../components/StoreButton.vue';
import PartButton from '../components/PartButton.vue';
import ColorButton from '../components/ColorButton.vue';
import ObjectCache from '../idb/ObjectCacheClass';
import QuantityInput from '../components/QuantityInput.vue';
import { getCartItems, getCartPageCart, getCartPageCartItem, setCartQuantity } from '../idb/carts';
import { getDbConnection } from '../idb/idb';

interface CartPageStore {
  store: Store
  pieces: number
  items: number
  cost: number  
}

async function updateCartQuantity(item: CartPageCartItem, newQuantity: number, index: number) {
  console.log(item, newQuantity)
  if (!item.store) {
    return
  }
  const response = await setCartQuantity(item.store, item.invItemId, item.price, newQuantity)
  if (response) {
    if (newQuantity === 0) {
      items.value.splice(index, 1)
    } else {
      item.quantity = newQuantity
    }
  }
}
const stores = computed(() => {
  const map = new Map<string, CartPageCartItem[]>()
  items.value.forEach(item => {
    let value = map.get(item.storeId)
    if (!value) {
      value = []
    }
    value.push(item)
    map.set(item.storeId, value)
  })
  const stores: CartPageStore[] = []
  map.forEach((value) => {
    let pieces = 0
    let items = value.length
    let cost = 0
    const store = value[0].store
    value.forEach(cartItem => {
      pieces += cartItem.quantity
      cost += cartItem.quantity * Number.parseFloat(cartItem.price)
    })
    cost = cost / 100
    stores.push({
      store,
      pieces,
      items,
      cost
    })
  })
  return stores
})

</script>

<template>
  <div v-if="cart">
    <HomeButton />
    <h4>Cart</h4>
    <h4>Stores ({{ stores.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Store</th>
          <th>Pieces</th>
          <th>Items</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(store, index) in stores" :key="store.store.id">
          <td>
            <StoreButton :store="store.store" />
          </td>
          <td>{{ formatInteger(store.pieces) }}</td>
          <td>{{ formatInteger(store.items) }}</td>
          <td>EUR {{ formatAmount(store.cost) }}</td>
        </tr>
      </tbody>
    </table>
    <h4 v-if="cartItems">Items (<span v-if="items.length < cartItems.length">{{ items.length }} / </span>{{ cart.cartItems.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Store</th>
          <th>Name</th>
          <th>Condition</th>
          <th>Color</th>
          <th>Category</th>
          <th>Price</th>
          <th>Price Score</th>
          <th>Quantity</th>
          <th>Total cost (EUR)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="item.id">
          <td><img
            :src="item.variant.image"
            @click="goVariant(item.variant)"
          ></td>
          <td>
            <StoreButton :store="item.store" />
          </td>
          <td>
            <PartButton :part="item.part" />
          </td>
          <td><ConditionButton :condition="item.invItem.condition" /></td>
          <td><ColorButton :color="item.color" /></td>
          <td><ExternalCategoryButton :category="item.category" /></td>
          <td>{{ formatAmount(item.price) }}</td>
          <td>{{ item.priceScore }}</td>
          <td><QuantityInput :current="item.quantity" :max="item.invItem.quantity" @update-quantity="updateCartQuantity(item, $event, index)" /></td>
          <td>{{ formatAmount(Number.parseFloat(item.price) * item.quantity / 100) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>