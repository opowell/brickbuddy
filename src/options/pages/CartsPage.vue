<script setup lang="ts">
import { CartsPageCart } from '../types';

const carts = ref<CartsPageCart[] | undefined>(undefined)
onMounted(async () => {
  carts.value = await getCartsPageCarts()
})
import HomeButton from '../components/HomeButton.vue';
import { addCart, getCartsPageCarts, setActiveCart } from '../idb/carts';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';
import CartButton from '../components/CartButton.vue';
import { formatInteger, formatAmount } from '../utils';
async function add() {
  await addCart()
  carts.value = await getCartsPageCarts()
}
async function setActive(cart: CartsPageCart) {
  await setActiveCart(toRaw(cart))
  carts.value = await getCartsPageCarts()
}
</script>

<template>
  <div v-if="!carts">
    Loading...
  </div>
  <div v-else>
    <HomeButton />
    <ActiveCartButton />
    <ActiveSearchButton />
    <h4>Carts ({{ carts.length }})</h4>
    <button @click="add">
      Add
    </button>
    <table>
      <thead>
        <tr>
          <th>Active</th>
          <th>Name</th>
          <th>Stores</th>
          <th>Inv. Items</th>
          <th>Quantity</th>
          <th>Cost (EUR)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cart in carts" :key="cart.id">
          <td><button v-if="cart.active !== 1" @click="setActive(cart)">Set</button></td>
          <td>
            <CartButton :cart="cart" />
          </td>
          <td>
            {{ cart.numStores }}
          </td>
          <td>
            {{ cart.numInvItems }}
          </td>
          <td>
            {{ formatInteger(cart.quantity) }}
          </td>
          <td>
            {{ formatAmount(cart.cost/100) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>