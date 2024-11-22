<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import { getActiveSearchPageSearch, setPriceScoreQuantity } from '../idb/idb';
import { formatAmount, formatInteger } from '../utils';

import { ActiveCartPageCart, CartPageCartItem } from '../types';
const cart = ref<ActiveCartPageCart | undefined>(undefined)
onMounted(async () => {
  cart.value = await getActiveCartPageCart()
})
import CategoryButton from '../components/CategoryButton.vue';
import ConditionButton from '../components/ConditionButton.vue';
const items = ref<CartPageCartItem[]>([])

function goVariant(invItem: StorePageInvItem) {

}
</script>

<template>
  <div v-if="cart">
    <HomeButton />
    <h4>Active Cart</h4>
    <h4>Items ({{ items.length }} / {{ cart.items.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Store</th>
          <th>Name</th>
          <th>Condition</th>
          <th>Color</th>
          <th>Category</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Price Score</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td><img
            :src="item.image"
            @click="goVariant(item.variant)"
          ></td>
          <td>
            <StoreButton :store="item.store" />
          </td>
          <td>
            <PartButton :part="item.part" />
          </td>
          <td><ConditionButton :condition="item.condition" /></td>
          <td><ColorButton :color="item.color" /></td>
          <td><CategoryButton :category="item.category" /></td>
          <td>{{ formatInteger(item.quantity) }} / {{ formatInteger(item.maxQuantity) }}</td>
          <td>{{ formatAmount(item.price) }}</td>
          <td>{{ item.priceScore }}</td>
          <td>
            <div>
              <div>
                <input type="number"><button>Change</button>
              </div>
              <div>
                <button>Remove</button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>