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
const router = useRouter()
const category = ref<CategoryPageCategory | undefined>()
onMounted(async () => {
  category.value = await getCategoryPageCategory(route.params.id - 0)
})
const parts = computed(() => {
  if (!category.value) {
    return []
  }
  return category.value.parts
})
</script>

<template>
  <div v-if="category">
    <HomeButton />
    <CategoriesButton />
    <ActiveSearchButton />
    <h4>{{ category.id }}</h4>
    <IncludeCategoryButton :category="category" @include="router.push(Crumbs.categories.href)"/>
    <ExcludeCategoryButton :category="category" @exclude="router.push(Crumbs.categories.href)"/>
    <h4>External categories</h4>
    <div v-for="externalCategory in category.externalCategories"><ExternalCategoryButton :category="externalCategory" /></div>
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
            <PartButton :part="part" />
          </td>
          <td>{{ part.numVariants }}</td>
          <td>{{ part.numInvItems }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else>
    No category.
  </div>
</template>