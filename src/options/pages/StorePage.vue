<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import StoresButton from '../components/StoresButton.vue';
import { ActiveSearch, StorePageInvItem, StorePageStore, StoreType, type UiInvItem } from '../types';
import { useRoute } from 'vue-router'
import { getActiveSearch, getDbConnection, getStorePageInvItem, getStorePageStore, getStorePrices, setCartQuantity } from '../idb/idb';
import PartButton from '../components/PartButton.vue';
import ColorButton from '../components/ColorButton.vue';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';
import { IDBPDatabase } from 'idb';
import { formatAmount, formatInteger } from '../utils';
import CategoryButton from '../components/CategoryButton.vue';
import ConditionButton from '../components/ConditionButton.vue';
import ObjectCache from '../idb/ObjectCache';
import PartVariantButton from '../components/PartVariantButton.vue';
import QuantityInput from '../components/QuantityInput.vue';
const route = useRoute()
const store = ref<StorePageStore | undefined>(undefined)
const search = ref<ActiveSearch | undefined>(undefined)
const db = ref<IDBPDatabase | undefined>(undefined)
const items = ref<StorePageInvItem[]>([])
onMounted(async () => {
  search.value = getActiveSearch()
  db.value = await getDbConnection()
  const objectCache = new ObjectCache(db.value)
  store.value = await getStorePageStore(route.params.id)
  if (!store.value) {
    return
  }
  for (let i = 0; i < store.value.items.length; i++) {
    const storePageInvItem = await getStorePageInvItem(objectCache, store.value.items[i])
    if (!storePageInvItem) {
      continue
    }
    items.value.push(storePageInvItem)
  }
})

function getImageSrc(invItem: StorePageInvItem) {
  const variant = getVariant(invItem)
  if (!variant) {
    return
  }
  return variant.image
}
function getVariant(invItem: StorePageInvItem) {
  return invItem.item.variants.find(v => v.colorId === invItem.colorId)
}
// URL for shipping terms:
// https://store.bricklink.com/ajax/clone/store/policy.ajax?sid=2066952

// URL for cart, includes weights:
// https://store.bricklink.com/ajax/clone/cart/list.ajax?sid=2066952&sum=0&_=1730928837742
const url = computed(() => {
  if (!store.value) {
    return
  }
  if (store.value.type === StoreType.BrickLink) {
    return 'https://store.bricklink.com/' + store.value?.slug
  }
  return store.value.slug
})

async function updateCartQuantity(item: StorePageInvItem, newQuantity: number) {
  if (!store.value) {
    return
  }
  const response = await setCartQuantity(store.value, item, newQuantity)
  if (response) {
    item.cartQuantity = newQuantity
  }
  if (cartButton.value) {
    cartButton.value.refresh()
  }
}

const cartButton = ref<typeof ActiveCartButton | undefined>(undefined)
</script>


<template>
  <HomeButton />
  <StoresButton />
  <ActiveSearchButton />
  <ActiveCartButton ref="cartButton" />
  <div v-if="store">
    <h4>{{ store.name }}</h4>
    <div v-if="db"><button @click="getStorePrices(db, store)">Scrape</button></div>
    <div>Fetch index: {{ store.fetchPageIndex }} / {{ store.fetchMaxPageIndex }}</div>
    <div>Last scraped: {{ store.lastScraped.toISOString() }}</div>
    <div>Price adjustment: {{ store.priceAdjustment }}%</div>
    <div>Link: <a target="_blank" :href="url">{{ url }}</a></div>
    <h4>Inventory ({{ items.length }} / {{ store.items.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Name</th>
          <th v-if="search && search.conditions.excluded.length < 1">Condition</th>
          <th>Color</th>
          <th>Category</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Price Score</th>
          <th>Cart</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.invId">
          <td>
            <PartVariantButton :part="item.item" :variant="item.variant">
              <img :src="getImageSrc(item)">
            </PartVariantButton>
          </td>
          <td>
            <PartButton :part="item.item" />
          </td>
          <td v-if="search && search.conditions.excluded.length < 1"><ConditionButton :condition="item.condition" /></td>
          <td><ColorButton :color="{ id: item.colorId, name: item.colorName }" /></td>
          <td><CategoryButton :category="item.category" /></td>
          <td>{{ formatInteger(item.quantity) }}</td>
          <td>{{ formatAmount(item.price*store.priceAdjustment/100) }}</td>
          <td>{{ item.priceScore }}</td>
          <td>
            <QuantityInput
              :current="item.quantity"
              @update-quantity="updateCartQuantity(item, $event)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else>
    Loading...
  </div>
</template>

<style lang="css" scoped>
input {
  width: 70px;
}</style>