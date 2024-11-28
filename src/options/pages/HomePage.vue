<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';
import { HomeData } from '../types';
import { getHomeData } from '../idb/idb';
const homeData = ref<HomeData | undefined>(undefined)
onMounted(async () => {
  homeData.value = await getHomeData()
})
import CardComponent from '../components/CardComponent.vue';
</script>

<template>
  <div>
    <h4>Brick Buddy</h4>
    <p>
      <ActiveSearchButton />
      <ActiveCartButton />
    </p>
    <div class="cards">
      <CardComponent v-if="homeData" name="Stores" :count="homeData.stores" :href="Crumbs.stores.href" />
      <CardComponent v-if="homeData" name="Colors" :count="homeData.colors" :href="Crumbs.colors.href" />
      <CardComponent v-if="homeData" name="BL Categories" :count="homeData.brickLinkCategories" :href="Crumbs.brickLinkCategories.href" />
      <CardComponent v-if="homeData" name="Categories" :count="homeData.categories" :href="Crumbs.categories.href" />
      <CardComponent v-if="homeData" name="Parts" :count="homeData.parts" :href="Crumbs.parts.href" />
      <CardComponent v-if="homeData" name="Searches" :count="homeData.searches" :href="Crumbs.searches.href" />
      <CardComponent v-if="homeData" name="Conditions" :count="homeData.conditions" :href="Crumbs.conditions.href" />
      <CardComponent v-if="homeData" name="Lists" :count="homeData.lists" :href="Crumbs.lists.href" />
      <CardComponent v-if="homeData" name="Carts" :count="homeData.carts" :href="Crumbs.carts.href" />
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