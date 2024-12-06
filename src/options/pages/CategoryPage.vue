<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import CategoriesButton from '../components/CategoriesButton.vue';
import HomeButton from '../components/HomeButton.vue';

import { useRoute } from 'vue-router'
import { getCategoryPageCategory } from '../idb/categories';
import { CategoryPageCategory } from '../types';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';
const route = useRoute()
import { useRouter } from 'vue-router'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import PartButton from '../components/PartButton.vue';
import NameIdLabel from '../components/NameIdLabel.vue';
import { activeCategories, categoriesMap, objectCache } from '../idb/idb';
const router = useRouter()
const category = computed(() => {
  return categoriesMap.value.get(route.params.id - 0)
})
// onMounted(async () => {
//   category.value = await getCategoryPageCategory(route.params.id - 0)
// })
</script>

<template>
  <div v-if="category && categoriesMap && objectCache && activeCategories">
    <HomeButton />
    <CategoriesButton />
    <ActiveSearchButton />
    <h4>{{ category.id }}</h4>
    <IncludeCategoryButton :category="category" @include="router.push(Crumbs.categories.href)"/>
    <ExcludeCategoryButton :category="category" @exclude="router.push(Crumbs.categories.href)"/>
    <h4>External categories</h4>
    <div v-for="externalCategory in category.externalCategories">{{ externalCategory.type }}: <NameIdLabel is-span :id="externalCategory.id" :name="externalCategory.name" /></div>
    <h4>Parts ({{ category.parts?.value?.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Colors</th>
          <th>Inv. items</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="part in category.parts.value" :key="part.itemId">
          <td><img v-if="part.image.value" :src="part.image.value"></td>
          <td>
            <PartButton :part="part" />
          </td>
          <td>{{ part.variants.length }}</td>
          <td>{{ part.invItems.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else>
    No category.
  </div>
</template>