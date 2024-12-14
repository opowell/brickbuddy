<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';
import { liveObjectCache } from '../idb/idb';
import CardComponent from '../components/CardComponent.vue';
import { HomeData } from '../types';

const homeData = ref<HomeData | undefined>()
const computedHomeData = computed<HomeData | undefined>(() => {
  if (liveObjectCache.computedCache.loaded) {
    return liveObjectCache.computedCache.homeData.value
  }
  return homeData.value
})
const computedCache = computed(() => {
  return liveObjectCache.computedCache
})
const categories = computed(() => {
  if (computedCache.value.categoriesArraySearchFiltered.value) {
    return computedCache.value.categoriesArraySearchFiltered.value.length
  }
  return homeData.value?.categories
})
const items = computed(() => {
  if (computedCache.value.itemsArray2.value) {
    return computedCache.value.itemsArray2.value.length
  }
  return homeData.value?.parts
})
onMounted(async () => {
  if (!liveObjectCache.computedCache.homeData.value) {
    homeData.value = await liveObjectCache.getHomeData()
  }
})
</script>

<template>
  <div>
    <h4>Brick Buddy</h4>
    <p>
      <ActiveSearchButton />
      <ActiveCartButton />
    </p>
    <div v-if="computedHomeData">Cache loaded</div>
    <div v-if="computedCache.categoriesArraySearchFiltered.value">Computed cache loaded: {{ computedCache.categoriesArraySearchFiltered.value.length }}</div>
    <div v-if="computedCache.externalItemsArray.value">externalItemsArray: {{ computedCache.externalItemsArray.value.length }}</div>
    <div v-if="computedCache.externalItemsArray2.value">externalItemsArray2: {{ computedCache.externalItemsArray2.value.length }}</div>
    <div v-if="computedCache.itemsArray2.value">itemsArray2: {{ computedCache.itemsArray2.value.length }}</div>
    <div v-if="!computedHomeData">Loading...</div>
    <div v-else class="cards">
      <CardComponent name="Stores" :count="computedHomeData.stores" :href="Crumbs.stores.href" />
      <CardComponent name="Colors" :count="computedHomeData.colors" :href="Crumbs.colors.href" />
      <CardComponent v-if="categories" name="Categories" :count="categories" :href="Crumbs.categories.href" />
      <CardComponent v-if="items" name="Parts" :count="items" :href="Crumbs.parts.href" />
      <CardComponent name="Searches" :count="computedHomeData.searches" :href="Crumbs.searches.href" />
      <CardComponent name="Conditions" :count="computedHomeData.conditions" :href="Crumbs.conditions.href" />
      <CardComponent name="Lists" :count="computedHomeData.lists" :href="Crumbs.lists.href" />
      <CardComponent name="Carts" :count="computedHomeData.carts" :href="Crumbs.carts.href" />
    </div>
  </div>
</template>
<style lang="css" scoped>
.cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>