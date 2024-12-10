<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import { getSearchPageSearch, setPriceScoreQuantity } from '../idb/searches'
import { SearchPageSearch } from '../types';
const search = ref<SearchPageSearch | undefined>(undefined)
const priceScoreQuantity = ref<number>(100)
const route = useRoute()
onMounted(async () => {
  search.value = await getSearchPageSearch(route.params.id - 0)
  if (!search.value) {
    return
  }
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
    <h4 v-if="search.filters">Filters ({{ search.filters.length }})</h4>
    <table v-if="search.filters">
      <thead>
        <tr>
          <th>Excluded</th>
          <th>Type</th>
          <th>Object</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="filter in search.filters" :key="filter.type + filter.objectId">
          <td>{{ filter.isExcluded ? 'Yes' : 'No' }}</td>
          <td>{{ filter.type }}</td>
          <td>{{ filter.objectId }}</td>
          <td><button>Remove</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>