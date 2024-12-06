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
import ExternalPartButton from '../components/ExternalPartButton.vue';
import NameIdLabel from '../components/NameIdLabel.vue';
import { activeCache, activeCategories, categoriesMap, objectCache } from '../idb/idb';
const router = useRouter()
const category = computed(() => {
  return categoriesMap.value.get(route.params.id - 0)
})
const parts = computed(() => {
  if (!category.value) {
    return []
  }
  return category.value.parts.filter(p => p.variants.length > 0)
})
</script>

<template>
  <div v-if="activeCache && category && categoriesMap && objectCache && activeCategories">
    <HomeButton />
    <CategoriesButton />
    <ActiveSearchButton />
    <h4>{{ category.id }}</h4>
    <IncludeCategoryButton :category="category" @include="router.push(Crumbs.categories.href)"/>
    <ExcludeCategoryButton :category="category" @exclude="router.push(Crumbs.categories.href)"/>
    <h4>External categories</h4>
    <div v-for="externalCategory in category.externalCategories">{{ externalCategory.type }}: <NameIdLabel is-span :id="externalCategory.id" :name="externalCategory.name" /></div>
    <h4>Parts ({{ parts.length }})</h4>
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
        <tr v-for="part in parts" :key="part.itemId">
          <td><img v-if="part.image" :src="part.image"></td>
          <td>
            <ExternalPartButton :part="part" />
          </td>
          <td>{{ part.variants.length }}</td>
          <td>{{ part.invItems?.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else>
    No category.
  </div>
</template>