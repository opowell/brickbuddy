<script setup lang="ts">
import { Crumbs } from "../idb/constants";
import { liveObjectCache } from "../idb/idb";
import CardComponent from "../components/CardComponent.vue";
import { getSearchPageSearch } from "../idb/searches";
import { SearchPageSearch } from "../types";
import SearchButton from "../components/SearchButton.vue";
import NameIdLabel from "../components/NameIdLabel.vue";

const stores = ref<number | undefined>();
const countries = ref<number | undefined>();
const colors = ref<number | undefined>();
const categories = ref<number | undefined>();
const parts = ref<number | undefined>();
const conditions = ref<number | undefined>();
const route = useRoute();
const search = ref<SearchPageSearch | undefined>(undefined);
onMounted(async () => {
  search.value = await getSearchPageSearch(route.params.id - 0);
  if (!search.value) {
    return;
  }
  colors.value = await liveObjectCache.getHomePageNumColors();
  stores.value = await liveObjectCache.getHomePageNumStores();
  countries.value = await liveObjectCache.getHomePageNumCountries();
  categories.value = await liveObjectCache.getHomePageNumCategories();
  parts.value = await liveObjectCache.getHomePageNumParts();
  conditions.value = await liveObjectCache.getHomePageNumConditions();
});
const loaded = computed(() => {
  return (
    stores.value !== undefined &&
    countries.value !== undefined &&
    colors.value !== undefined &&
    categories.value !== undefined
  );
});
</script>

<template>
  <div>
    <div v-if="!loaded || !search">Loading...</div>
    <template v-else>
      <h4>Search <NameIdLabel is-span :id="search.id" :name="search.name" /></h4>
      <SearchButton :search="search" label="Edit" />
      <div class="cards">
        <CardComponent
          name="Countries"
          :count="countries"
          :href="Crumbs.storeCountries.href"
        />
        <CardComponent name="Stores" :count="stores" :href="Crumbs.stores.href" />
        <CardComponent name="Colors" :count="colors" :href="Crumbs.colors.href" />
        <CardComponent
          name="Categories"
          :count="categories"
          :href="Crumbs.categories.href"
        />
        <CardComponent name="Parts" :count="parts" :href="Crumbs.parts.href" />
        <CardComponent
          name="Conditions"
          :count="conditions"
          :href="Crumbs.conditions.href"
        />
      </div>
    </template>
  </div>
</template>
<style lang="css" scoped>
.cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
