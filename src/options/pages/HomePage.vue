<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';
import { liveObjectCache } from '../idb/idb';
import CardComponent from '../components/CardComponent.vue';
import { reportTime, startTimer } from '../utils';

const stores = ref<number | undefined>()
const colors = ref<number | undefined>()
const categories = ref<number | undefined>()
const parts = ref<number | undefined>()
onMounted(async () => {
  startTimer('HomePage')
  colors.value = await liveObjectCache.getHomePageNumColors()
  stores.value = await liveObjectCache.getHomePageNumStores()
  categories.value = await liveObjectCache.getHomePageNumCategories()
  parts.value = await liveObjectCache.getHomePageNumParts()
})
const loaded = computed(() => {
  return (
    !!stores.value &&
    !!colors.value &&
    !!categories.value
  )
})
watch(loaded, () => {
  if (loaded) {
    reportTime('HomePage')
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
    <div v-if="!loaded">Loading...</div>
    <div v-else class="cards">
      <CardComponent name="Stores" :count="stores" :href="Crumbs.stores.href" />
      <CardComponent name="Colors" :count="colors" :href="Crumbs.colors.href" />
      <CardComponent name="Categories" :count="categories" :href="Crumbs.categories.href" />
      <CardComponent name="Parts" :count="parts" :href="Crumbs.parts.href" />
      <!-- <CardComponent name="Searches" :count="homeData.searches" :href="Crumbs.searches.href" />
      <CardComponent name="Conditions" :count="homeData.conditions" :href="Crumbs.conditions.href" />
      <CardComponent name="Lists" :count="homeData.lists" :href="Crumbs.lists.href" />
      <CardComponent name="Carts" :count="homeData.carts" :href="Crumbs.carts.href" /> -->
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