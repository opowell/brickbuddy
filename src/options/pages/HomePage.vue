<script setup lang="ts">
import { Crumbs } from "../idb/constants";
import { liveObjectCache } from "../idb/idb";
import CardComponent from "../components/CardComponent.vue";
import ActiveSearchButton from "../components/ActiveSearchButton.vue";

const stores = ref<number | undefined>();
const allStores = ref<number | undefined>();
const countries = ref<number | undefined>();
const allCountries = ref<number | undefined>();
const colors = ref<number | undefined>();
const allColors = ref<number | undefined>();
const categories = ref<number | undefined>();
const allCategories = ref<number | undefined>();
const parts = ref<number | undefined>();
const allParts = ref<number | undefined>();
const searches = ref<number | undefined>();
const allConditions = ref<number | undefined>();
const conditions = ref<number | undefined>();
const lists = ref<number | undefined>();
const carts = ref<number | undefined>();
onMounted(async () => {
  colors.value = await liveObjectCache.getHomePageNumColors();
  allColors.value = await liveObjectCache.getNumColors();
  stores.value = await liveObjectCache.getHomePageNumStores();
  allStores.value = await liveObjectCache.getHomePageNumAllStores();
  countries.value = await liveObjectCache.getHomePageNumCountries();
  allCountries.value = await liveObjectCache.getNumCountries();
  categories.value = await liveObjectCache.getHomePageNumCategories();
  allCategories.value = await liveObjectCache.getNumCategories();
  parts.value = await liveObjectCache.getHomePageNumParts();
  allParts.value = await liveObjectCache.getNumParts();
  searches.value = await liveObjectCache.getHomePageNumSearches();
  conditions.value = await liveObjectCache.getHomePageNumConditions();
  allConditions.value = await liveObjectCache.getNumConditions();
  lists.value = await liveObjectCache.getHomePageNumLists();
  carts.value = await liveObjectCache.getHomePageNumCarts();
});
const loaded = computed(() => {
  return (
    stores.value !== undefined &&
    countries.value !== undefined &&
    colors.value !== undefined &&
    categories.value !== undefined
  );
});

const rows = computed(() => {
  return [
    {
      label: "Stores",
      count: stores.value,
      total: allStores.value,
      link: Crumbs.stores.href,
    },
    {
      label: "Categories",
      count: categories.value,
      total: allCategories.value,
      link: Crumbs.categories.href,
    },
    {
      label: "Colors",
      count: colors.value,
      total: allColors.value,
      link: Crumbs.colors.href,
    },
    {
      label: "Countries",
      count: countries.value,
      total: allCountries.value,
      link: Crumbs.storeCountries.href,
    },
    {
      label: "Conditions",
      count: conditions.value,
      total: allConditions.value,
      link: Crumbs.conditions.href,
    },
    {
      label: "Parts",
      count: parts.value,
      total: allParts.value,
      link: Crumbs.parts.href,
    },
  ];
});
</script>

<template>
  <div>
    <p>Search: <ActiveSearchButton /></p>
    <div v-if="!loaded">Loading...</div>
    <div v-else class="cards">
      <CardComponent
        v-for="row in rows"
        :key="row.label"
        :name="row.label"
        :count="row.count"
        :total="row.total"
        :href="row.link"
      />
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
