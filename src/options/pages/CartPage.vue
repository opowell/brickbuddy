<script setup lang="ts">
import HomeButton from "../components/HomeButton.vue";
import { formatAmount, formatInteger } from "../utils";

import { CartItem, CartPageCart, CartPageCartItem, Store, StoreType } from "../types";
import { useRoute } from "vue-router";
const route = useRoute();
const cart = ref<CartPageCart | undefined>(undefined);
const cartItems = ref<CartItem[] | undefined>(undefined);
const items = ref<CartPageCartItem[]>([]);
onMounted(async () => {
  const db = await getDbConnection();
  cart.value = await getCartPageCart(db, route.params.id - 0);
  if (!cart.value) {
    return;
  }

  cartItems.value = await getCartItems(cart.value);
  if (!cartItems.value) {
    return;
  }
  for (let i = 0; i < cartItems.value.length; i++) {
    const cartPageCartItem = await getCartPageCartItem(cartItems.value[i]);
    if (!cartPageCartItem) {
      continue;
    }
    items.value.push(cartPageCartItem);
  }
});
const filteredItems = computed<CartPageCartItem[]>(() => {
  if (!selectedStoreId.value) {
    return items.value;
  }
  return items.value.filter((i) => i.storeId === selectedStoreId.value);
});
import ExternalCategoryButton from "../components/ExternalCategoryButton.vue";
import ConditionButton from "../components/ConditionButton.vue";
import StoreButton from "../components/StoreButton.vue";
import PartButton from "../components/PartButton.vue";
import ColorButton from "../components/ColorButton.vue";
import QuantityInput from "../components/QuantityInput.vue";
import {
  getCartItems,
  getCartPageCart,
  getCartPageCartItem,
  setCartQuantity,
} from "../idb/carts";
import { getDbConnection } from "../idb/idb";

interface CartPageStore {
  store: Store;
  pieces: number;
  items: CartPageCartItem[];
  cost: number;
  addingToBrickLink?: boolean;
  resultAdding?: RESULT;
}

async function updateCartQuantity(
  item: CartPageCartItem,
  newQuantity: number,
  index: number
) {
  console.log(item, newQuantity);
  if (!item.store) {
    return;
  }
  const response = await setCartQuantity(
    item.store,
    item.invItemId,
    item.price,
    newQuantity
  );
  if (response) {
    if (newQuantity === 0) {
      items.value.splice(index, 1);
    } else {
      item.quantity = newQuantity;
    }
  }
}
const selectedStoreId = ref<string | undefined>();
const addingToBrickLinkMap = ref(new Map<string, boolean>());
const stores = computed(() => {
  const map = new Map<string, CartPageCartItem[]>();
  items.value.forEach((item) => {
    let value = map.get(item.storeId);
    if (!value) {
      value = [];
    }
    value.push(item);
    map.set(item.storeId, value);
  });
  const stores: CartPageStore[] = [];
  map.forEach((items) => {
    let pieces = 0;
    let cost = 0;
    const store = items[0].store;
    items.forEach((cartItem) => {
      pieces += cartItem.quantity;
      cost += cartItem.quantity * Number.parseFloat(cartItem.price);
    });
    cost = cost / 100;
    stores.push({
      store,
      pieces,
      items,
      cost,
      addingToBrickLink: addingToBrickLinkMap.value.get(store.id),
      resultAdding: resultAddingCartMap.value.get(store.id),
    });
  });
  return stores;
});
enum RESULT {
  SUCCESS = "success",
  FAILURE = "failure",
}

const resultAddingCartMap = ref(new Map<string, RESULT>());
async function addToBrickLinkCart(
  store: CartPageStore,
  items: CartPageCartItem[],
  retryIfFail = true
) {
  resultAddingCartMap.value.delete(store.store.id);
  addingToBrickLinkMap.value.set(store.store.id, true);
  const itemArray = encodeURIComponent(
    JSON.stringify(
      items.map((i) => {
        return {
          invID: i.invItemId,
          invQty: i.quantity,
          sellerID: store.store.id,
          sourceType: 1,
        };
      })
    )
  );
  const response = await fetch("https://store.bricklink.com/ajax/clone/cart/add.ajax", {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en,de;q=0.9,es;q=0.8,en-US;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      pragma: "no-cache",
      priority: "u=1, i",
      "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer:
      "https://store.bricklink.com/" + store.store.slug + "?p=" + store.store.slug,
    referrerPolicy: "no-referrer-when-downgrade",
    body: "itemArray=" + itemArray + "&sid=" + store.store.id + "&srcLocation=1100",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  const responseJson = await response.json();
  if (responseJson.errors === 0) {
    resultAddingCartMap.value.set(store.store.id, RESULT.SUCCESS);
  } else if (retryIfFail) {
    // try again without error items
    const OK_CODE = "0";
    interface ItemReturnStatus {
      code: string;
      invID: number;
    }
    const itemReturnStatuses: ItemReturnStatus[] = responseJson.itemReturnStatus;
    const errorItems = itemReturnStatuses.filter((s) => s.code !== OK_CODE);
    const errorIds = errorItems.map((s) => s.invID + "");
    const okItems = items.filter((item) => !errorIds.includes(item.invItemId));
    return addToBrickLinkCart(store, okItems, false);
  }
  addingToBrickLinkMap.value.set(store.store.id, false);
}
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
          <th>Add to BrickLink cart</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="store in stores" :key="store.store.id">
          <td>
            <StoreButton :store="store.store" />
          </td>
          <td>{{ formatInteger(store.pieces) }}</td>
          <td>{{ formatInteger(store.items.length) }}</td>
          <td>EUR {{ formatAmount(store.cost) }}</td>
          <td>
            <button
              v-if="store.store.type === StoreType.BrickLink"
              :disabled="store.addingToBrickLink"
              @click="addToBrickLinkCart(store, store.items)"
            >
              {{ store.addingToBrickLink ? "Adding..." : "Add" }}
            </button>
            <span v-if="store.resultAdding">
              &nbsp;{{ store.resultAdding === RESULT.SUCCESS ? "OK" : "ERROR" }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <template v-if="cartItems">
      <h4 v-if="selectedStoreId">Items ({{ filteredItems.length }})</h4>
      <h4 v-else>
        Items (<span v-if="items.length < cartItems.length">{{ items.length }} / </span
        >{{ cart.cartItems.length }})
      </h4>
    </template>
    <div>
      Store:
      <select v-model="selectedStoreId">
        <option v-for="store in stores" :value="store.store.id">
          {{ store.store.name }}
        </option>
      </select>
      <button @click="selectedStoreId = undefined">Clear</button>
    </div>
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
        <tr v-for="(item, index) in filteredItems" :key="item.id">
          <td><img :src="item.variant.image" @click="goVariant(item.variant)" /></td>
          <td>
            <StoreButton :store="item.store" />
          </td>
          <td><PartButton :part="item.part" />{{ item.invItemId }}</td>
          <td><ConditionButton :condition="item.invItem.condition" /></td>
          <td><ColorButton :color="item.color" /></td>
          <td><ExternalCategoryButton :category="item.category" /></td>
          <td>{{ formatAmount(item.price) }}</td>
          <td>{{ item.priceScore }}</td>
          <td>
            <QuantityInput
              :current="item.quantity"
              :max="item.invItem.quantity"
              @update-quantity="updateCartQuantity(item, $event, index)"
            />
          </td>
          <td>
            {{ formatAmount((Number.parseFloat(item.price) * item.quantity) / 100) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
