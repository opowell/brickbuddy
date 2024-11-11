<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import StoresButton from '../components/StoresButton.vue';
import { ActiveSearch, type UiInvItem, type UiStore } from '../types';
import { useRoute } from 'vue-router'
import { getActiveSearch, getStorePageStore } from '../idb';
import PartButton from '../components/PartButton.vue';
import ColorButton from '../components/ColorButton.vue';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
const route = useRoute()
const store = ref<UiStore | undefined>(undefined)
const search = ref<ActiveSearch | undefined>(undefined)
onMounted(async () => {
  store.value = await getStorePageStore(route.params.id)
  search.value = getActiveSearch()
})

function getImageSrc(invItem: UiInvItem) {
  const variant = getVariant(invItem)
  if (!variant) {
    return
  }
  return variant.image
}
function goVariant(invItem: UiInvItem) {

}
function getVariant(invItem: UiInvItem) {
  return invItem.item.variants.find(v => v.colorId === invItem.color)
}
// URL for shipping terms:
// https://store.bricklink.com/ajax/clone/store/policy.ajax?sid=2066952

// URL for cart, includes weights:
// https://store.bricklink.com/ajax/clone/cart/list.ajax?sid=2066952&sum=0&_=1730928837742
const url = computed(() => {
  return 'https://store.bricklink.com/' + store.value?.slug
})
</script>


<template>
  <div v-if="store">
    <HomeButton />
    <StoresButton />
    <ActiveSearchButton />
    <h4>{{ store.name }}</h4>
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
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in store.items" :key="item.invId">
          <td><img
            :src="getImageSrc(item)"
            @click="goVariant(item)"
          ></td>
          <td>
            <PartButton :part="item.item" />
          </td>
          <td v-if="search && search.conditions.ids.length < 1">{{ item.condition }}</td>
          <td><ColorButton :color="{ id: item.color, name: item.colorName }" /></td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.price*store.priceAdjustment/100 }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else>
    Loading...
  </div>
</template>