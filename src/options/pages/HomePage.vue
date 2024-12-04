<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';
import { homeData } from '../idb/idb';
import { objectCache } from '../idb/idb';
import CardComponent from '../components/CardComponent.vue';
</script>

<template>
  <div>
    <h4>Brick Buddy</h4>
    <p>
      <ActiveSearchButton />
      <ActiveCartButton />
    </p>
    <div v-if="!homeData && !objectCache">Loading...</div>
    <div v-else class="cards">
      <CardComponent name="Stores" :count="homeData.stores" :href="Crumbs.stores.href" />
      <CardComponent name="Colors" :count="homeData.colors" :href="Crumbs.colors.href" />
      <CardComponent name="Categories" :count="homeData.categories" :href="Crumbs.categories.href" />
      <CardComponent name="Parts" :count="homeData.parts" :href="Crumbs.parts.href" />
      <CardComponent name="Searches" :count="homeData.searches" :href="Crumbs.searches.href" />
      <CardComponent name="Conditions" :count="homeData.conditions" :href="Crumbs.conditions.href" />
      <CardComponent name="Lists" :count="homeData.lists" :href="Crumbs.lists.href" />
      <CardComponent name="Carts" :count="homeData.carts" :href="Crumbs.carts.href" />
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