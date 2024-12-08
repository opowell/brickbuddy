<script setup lang="ts">
import { CachedExternalCategory, CategoriesPageCategory, ExternalCategory, SearchFilter } from '../types';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';
import { categories, objectCache, activeExternalCategories, externalCategoriesMap, getDbConnection } from '../idb/idb';
interface CategoriesPageUniqueCategory {
  externalCategories: CachedExternalCategory[]
  isExternal: boolean
  numParts: number
  image?: ComputedRef<string | undefined>
  id: number | string
  category: CategoriesPageCategory
}
function countUnique(iterable: Iterable) {
  return new Set(iterable).size;
}
const uniqueExternalCategories = computed<CategoriesPageUniqueCategory[]>(() => {
  if (!categories.value) {
    return []
  }
  const out: CategoriesPageUniqueCategory[] = []
  // console.log(categories.value.map(c => c.id).join(','))
  categories.value.forEach(category => {
    const types = category.externalCategories.map(ec => ec.type)
    if (countUnique(types) < types.length) {
      // add each ec individually
      category.externalCategories.forEach(ec => {
        if (ec.externalPartsFiltered.length === 0) {
          return
        }
        out.push({
          isExternal: true,
          externalCategories: [ec],
          numParts: ec.externalPartsFiltered.length,
          image: ec.image,
          id: ec.id,
          category
        })
      })
    } else {
      // add all ec together
      const numParts = category.externalCategories.reduce((sum, currentValue) => sum + currentValue.externalPartsFiltered.length, 0)
      const imageEc = category.externalCategories.find(ec => ec.image)
      const image = imageEc ? imageEc.image : undefined
      out.push({
        isExternal: false,
        externalCategories: category.externalCategories,
        numParts,
        image,
        id: category.id,
        category
      })
    }
  })
  return out
})
async function excludeCategory(externalCategory: ExternalCategory, index: number) {
  const search = getActiveSearch()
  if (!search) {
    return
  }
  const db = await getDbConnection()
  const filter: SearchFilter = {
    searchId: search.id,
    type: 'externalCategory',
    isExcluded: true,
    objectId: externalCategory.type + externalCategory.id
  }
  put(db, stores.SEARCH_FILTERS, filter)
  search.externalCategories.excluded.push(externalCategory.type + externalCategory.id)
}
function includeCategory(externalCategory: ExternalCategory, index: number) {
  // categories.value = categories.value?.splice(index, 1)
}
import CategoryButton from '../components/CategoryButton.vue';
import HomeButton from '../components/HomeButton.vue';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ExternalCategoryButton from '../components/ExternalCategoryButton.vue';
import { getActiveSearch } from '../idb/searches';
import { put } from '../idb/db';
import stores from '../idb/stores';
</script>

<template>
  <div v-if="!categories || !objectCache || !activeExternalCategories || !externalCategoriesMap">
    Loading...
  </div>
  <div v-else>
    <HomeButton />
    <ActiveSearchButton />
    <h4>Categories {{ categories ? '(' + categories.length + ')' : '' }}</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Names</th>
          <th>Parts</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(externalCategory, index) in uniqueExternalCategories" :key="index">
          <td><img v-if="externalCategory.image" :src="externalCategory.image"></td>
          <td>
            <ExternalCategoryButton v-if="externalCategory.isExternal" :category="externalCategory.externalCategories[0]" />
            <CategoryButton v-else :category="externalCategory.category" />
          </td>
          <td>
            {{ externalCategory.numParts }}
          </td>
          <td>
            <ExcludeCategoryButton :category="externalCategory.category" @exclude="excludeCategory(externalCategory, index)"/>
            <IncludeCategoryButton :category="externalCategory.category" @include="includeCategory(externalCategory, index)"/>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>