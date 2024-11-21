<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import StoresButton from '../components/StoresButton.vue';
import { ActiveSearch, StorePageInvItem, StorePageStore, StoreType, type UiInvItem } from '../types';
import { useRoute } from 'vue-router'
import { getActiveSearch, getDbConnection, getStorePageStore, getStorePrices } from '../idb/idb';
import PartButton from '../components/PartButton.vue';
import ColorButton from '../components/ColorButton.vue';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import { IDBPDatabase } from 'idb';
import { formatAmount, formatInteger } from '../utils';
import CategoryButton from '../components/CategoryButton.vue';
import ConditionButton from '../components/ConditionButton.vue';
const route = useRoute()
const store = ref<StorePageStore | undefined>(undefined)
const search = ref<ActiveSearch | undefined>(undefined)
const db = ref<IDBPDatabase | undefined>(undefined)
onMounted(async () => {
  db.value = await getDbConnection()
  store.value = await getStorePageStore(route.params.id)
  search.value = getActiveSearch()
})

function getImageSrc(invItem: StorePageInvItem) {
  const variant = getVariant(invItem)
  if (!variant) {
    return
  }
  return variant.image
}
function goVariant(invItem: StorePageInvItem) {

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
const items = computed(() => {
  if (!store.value) {
    return []
  }
  return store.value.items.map((item) => {
    return {
      ...item,
      priceScore: 1
    }
  })
})
</script>


<template>
  <HomeButton />
  <StoresButton />
  <ActiveSearchButton />
  <div v-if="store">
    <h4>{{ store.name }}</h4>
    <div v-if="db"><button @click="getStorePrices(db, store)">Scrape</button></div>
    <div>Fetch index: {{ store.fetchPageIndex }} / {{ store.fetchMaxPageIndex }}</div>
    <div>Last scraped: {{ store.lastScraped.toISOString() }}</div>
    <div>Price adjustment: {{ store.priceAdjustment }}%</div>
    <div>Link: <a target="_blank" :href="url">{{ url }}</a></div>
    <h4>Inventory ({{ store.items.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Name</th>
          <th v-if="search && search.conditions.ids.length < 1">Condition</th>
          <th>Color</th>
          <th>Category</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Price Score</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.invId">
          <td><img
            :src="getImageSrc(item)"
            @click="goVariant(item)"
          ></td>
          <td>
            <PartButton :part="item.item" />
          </td>
          <td v-if="search && search.conditions.ids.length < 1"><ConditionButton :condition="item.condition" /></td>
          <td><ColorButton :color="{ id: item.colorId, name: item.colorName }" /></td>
          <td><CategoryButton :category="item.category" /></td>
          <td>{{ formatInteger(item.quantity) }}</td>
          <td>{{ formatAmount(item.price*store.priceAdjustment/100) }}</td>
          <td>{{ item.priceScore }}</td>
          <td><input type="number"><button>Add to cart</button></td>
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