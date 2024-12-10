<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import CategoriesButton from '../components/CategoriesButton.vue';
import CategoryButton from '../components/CategoryButton.vue';
import HomeButton from '../components/HomeButton.vue';

import { useRoute } from 'vue-router'
import { CachedExternalCategory, ExternalCategory, ExternalItem } from '../types';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';
const route = useRoute()
import { useRouter } from 'vue-router'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ExternalPartButton from '../components/ExternalPartButton.vue';
import { externalCategoriesMap } from '../idb/idb';
import { getExternalCategoryPageExternalCategory } from '../idb/categories';
const router = useRouter()
interface Item extends ExternalItem {
  numVariants: number
  numInvItems: number
}
const category = ref()
onMounted(async () => {
  category.value = await getExternalCategoryPageExternalCategory(route.params.type, route.params.id)
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
        <tr v-for="part in category.externalParts" :key="part.itemId">
          <td><img v-if="part.image" :src="part.image"></td>
          <td>
            <ExternalPartButton :part="part" />
          </td>
          <td>{{ part.variants?.length }}</td>
          <td>{{ part.invItems?.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>