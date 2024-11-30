<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import { getSearchesPagesSearches, addNewSearch } from '../idb/searches';
import type { SearchesPageSearch } from '../types'
const searches = ref<SearchesPageSearch[] | undefined>(undefined)
onMounted(async () => {
  searches.value = await getSearchesPagesSearches()
})
</script>

<template>
  <div>
    <HomeButton />
    <h4>Searches</h4>
    <table>
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="search in searches" :key="search.id">
          <td>
            <button @click="$emit('goSearch', search)">
              {{ search.name }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <h4>Add</h4>
    <button @click="addNewSearch">
      Add
    </button>
  </div>
</template>