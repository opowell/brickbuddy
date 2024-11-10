<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import { getActiveSearchPageSearch } from '../idb';

import { ActiveSearchPageSearch } from '../types';
const search = ref<ActiveSearchPageSearch | undefined>(undefined)
onMounted(async () => {
  search.value = await getActiveSearchPageSearch()
})
import CategoryButton from '../components/CategoryButton.vue';
</script>

<template>
  <div v-if="search">
    <HomeButton />
    <h4>Active Search</h4>
    <template v-if="search.categories.ids.length">
      <div>Categories {{ '(' + search.categories.ids.length + ')' }}</div>
      <table>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Image</th>
            <th>Id</th>
            <th>Name</th>
            <th>Parts</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in search.categoryObjects" :key="category.id">
            <td>
              <button>x</button>
            </td>
            <td><img v-if="category.image" :src="category.image"></td>
            <td>
              {{ category.id }}
            </td>
            <td>
              <CategoryButton :category="category" />
            </td>
            <td>
              {{ category.numParts }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>