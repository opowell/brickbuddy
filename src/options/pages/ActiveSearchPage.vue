<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import { getSearchPageSearch, setPriceScoreQuantity } from '../idb/searches'
import { SearchPageSearch } from '../types';
const search = ref<SearchPageSearch | undefined>(undefined)
const priceScoreQuantity = ref<number>(100)
const route = useRoute()
onMounted(async () => {
  search.value = await getSearchPageSearch(route.params.id)
  priceScoreQuantity.value = search.value.priceScoreQuantity
})
import NameIdLabel from '../components/NameIdLabel.vue';
import CategoriesTable from '../components/CategoriesTable.vue';
import ConditionsTable from '../components/ConditionsTable.vue';
</script>

<template>
  <div v-if="search">
    <HomeButton />
    <h4>Search <NameIdLabel :id="search.id" :name="search.name" /></h4>
    <div>Price score quantity: <input v-model="priceScoreQuantity" type="number">
    <button @click="setPriceScoreQuantity(priceScoreQuantity)">Set</button></div>
    <template v-if="search.categories.included.length">
      <div>Included Categories {{ '(' + search.categories.included.length + ')' }}</div>
      <CategoriesTable
        :categories="search.includedCategoryObjects"
      />
    </template>
    <template v-if="search.categories.excluded.length">
      <div>Excluded Categories {{ '(' + search.categories.excluded.length + ')' }}</div>
      <CategoriesTable
        :categories="search.excludedCategoryObjects"
      />
    </template>
    <template v-if="search.conditions.included.length">
      <div>Conditions {{ '(' + search.conditions.included.length + ')' }}</div>
      <ConditionsTable :conditions="search.conditions.included" />
    </template>
    <template v-if="search.conditions.excluded.length">
      <div>Conditions {{ '(' + search.conditions.excluded.length + ')' }}</div>
      <ConditionsTable :conditions="search.conditions.excluded" />
    </template>
  </div>
</template>