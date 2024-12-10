<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import CategoriesButton from '../components/CategoriesButton.vue';
import CategoryButton from '../components/CategoryButton.vue';
import HomeButton from '../components/HomeButton.vue';

import { useRoute } from 'vue-router'
import { ExternalCategoryPageExternalCategory, ExternalCategoryPageExternalPart } from '../types';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';
const route = useRoute()
import { useRouter } from 'vue-router'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ExternalPartButton from '../components/ExternalPartButton.vue';
import { getExternalCategoryPageExternalCategory } from '../idb/categories';
const router = useRouter()
const category = ref<ExternalCategoryPageExternalCategory>()
onMounted(async () => {
  category.value = await getExternalCategoryPageExternalCategory(route.params.type, route.params.id)
})
const sortedParts = computed<ExternalCategoryPageExternalPart[]>(() => {
  if (!category.value) {
    return []
  }
  return category.value.externalParts.sort((a, b) => {
    if (!a.name) {
      return 1
    }
    if (!b.name) {
      return -1
    }
    return a.name > b.name ? 1 : -1
  })
})
</script>

<template>
  <div v-if="category">
    <HomeButton />
    <CategoriesButton />
    <ActiveSearchButton />
    <h4>External category: {{ category.type }} {{ category.name }} ({{ category.id }})</h4>
    <IncludeCategoryButton :category="category" @include="router.push(Crumbs.categories.href)"/>
    <ExcludeCategoryButton :category="category" @exclude="router.push(Crumbs.categories.href)"/>
    <div>Category: <CategoryButton :category="category.category" /></div>
    <h4>Parts ({{ category.externalParts.length }})</h4>
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
        <tr v-for="part in sortedParts" :key="part.itemId">
          <td><img v-if="part.image" :src="part.image"></td>
          <td>
            <ExternalPartButton :part="part" />
          </td>
          <td>{{ part.numVariants }}</td>
          <td>{{ part.numInvItems }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>