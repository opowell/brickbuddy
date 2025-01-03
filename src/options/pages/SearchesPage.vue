<script setup lang="ts">
import { getSearchesPagesSearches, addNewSearch } from "../idb/searches";
import type { SearchesPageSearch } from "../types";
const searches = ref<SearchesPageSearch[] | undefined>(undefined);
onMounted(async () => {
  searches.value = await getSearchesPagesSearches();
});
import SearchButton from "../components/SearchButton.vue";
</script>

<template>
  <div>
    <h4>Searches</h4>
    <table>
      <thead>
        <tr>
          <th>Active</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="search in searches" :key="search.id">
          <td>Yes</td>
          <td>
            <SearchButton :search="search" />
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="addNewSearch">Add</button>
  </div>
</template>
