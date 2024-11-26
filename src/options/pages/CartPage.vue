<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import { getActiveSearchPageSearch, getCartPageCart, getCartPageCartItem, getDbConnection, setCartQuantity, setPriceScoreQuantity } from '../idb/idb';
import { formatAmount, formatInteger } from '../utils';

import { CartPageCart, CartPageCartItem } from '../types';
const cart = ref<CartPageCart | undefined>(undefined)
const items = ref<CartPageCartItem[]>([])
onMounted(async () => {
  cart.value = await getCartPageCart(-1)
  if (!cart.value) {
    return
  }
  const db = await getDbConnection()
  const objectCache = new ObjectCache(db)

  for (let i = 0; i < cart.value.cartItems.length; i++) {
    const cartPageCartItem = await getCartPageCartItem(objectCache, cart.value.cartItems[i])
    if (!cartPageCartItem) {
      continue
    }
    items.value.push(cartPageCartItem)
  }

})
import CategoryButton from '../components/CategoryButton.vue';
import ConditionButton from '../components/ConditionButton.vue';
import StoreButton from '../components/StoreButton.vue';
import PartButton from '../components/PartButton.vue';
import ColorButton from '../components/ColorButton.vue';
import ObjectCache from '../idb/ObjectCache';
import QuantityInput from '../components/QuantityInput.vue';

async function updateCartQuantity(item: CartPageCartItem, newQuantity: number, index: number) {
  console.log(item, newQuantity)
  if (!item.store) {
    return
  }
  const response = await setCartQuantity(item.store, item, newQuantity)
  if (response) {
    if (newQuantity === 0) {
      items.value.splice(index, 1)
    } else {
      item.quantity = newQuantity
    }
  }
}

</script>

<template>
  <div v-if="cart">
    <HomeButton />
    <h4>Cart</h4>
    <h4>Items ({{ items.length }} / {{ cart.cartItems.length }})</h4>
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
            <PartButton :part="item.item" />
          </td>
          <td><ConditionButton :condition="item.condition" /></td>
          <td><ColorButton :color="item.color" /></td>
          <td><CategoryButton :category="item.category" /></td>
          <td>{{ formatAmount(item.price) }}</td>
          <td>{{ item.priceScore }}</td>
          <td><QuantityInput :current="item.quantity" :max="item.invItem.quantity" @update-quantity="updateCartQuantity(item, $event, index)" /></td>
          <td>{{ formatAmount(item.price * item.quantity / 100) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>