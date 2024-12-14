<script setup lang="ts">
import { CategoriesPageCategory, CategoriesPageExternalCategory, Category, ExternalCategory, SearchFilter } from '../types';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';
import { liveObjectCache } from '../idb/idb';
interface CategoriesPageUniqueCategory {
  externalCategories: CategoriesPageExternalCategory[]
  isExternal: boolean
  numParts: number
  image?: string
  id: number | string
  category: CategoriesPageCategory
}
function countUnique(iterable: Iterable) {
  return new Set(iterable).size;
}
const categories = ref<CategoriesPageCategory[] | undefined>(undefined)
const computedCategories = computed<CategoriesPageCategory[] | undefined>(() => {
  if (liveObjectCache.computedCache.loaded) {
    return liveObjectCache.computedCache.categoriesPageCategories.value
  }
  return categories.value
})
onMounted(async () => {
  if (!liveObjectCache.computedCache.categoriesPageCategories.value) {
    categories.value = await liveObjectCache.getCategoriesPageCategories()
  }
})
const uniqueExternalCategories = computed<CategoriesPageUniqueCategory[]>(() => {
  if (!computedCategories.value) {
    return []
  }
  const out: CategoriesPageUniqueCategory[] = []
  computedCategories.value.forEach(category => {
    const types = category.externalCategories.map(ec => ec.type)
    if (countUnique(types) < types.length) {
      // add each ec individually
      category.externalCategories.forEach(ec => {
        if (ec.parts.length === 0) {
          return
        }
        out.push({
          isExternal: true,
          externalCategories: [ec],
          numParts: ec.parts.length,
          image: ec.image,
          id: ec.id,
          category
        })
      })
    } else {
      // add all ec together
      const numParts = category.externalCategories.reduce((sum, currentValue) => sum + currentValue.parts.length, 0)
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
async function excludeCategory(category: Category) {
  const search = await getActiveSearch()
  if (!search) {
    return
  }
  const filter: SearchFilter = {
    searchId: search.id,
    type: 'category',
    isExcluded: true,
    objectId: category.id
  }
  put(liveObjectCache.db, stores.SEARCH_FILTERS, filter)
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
  <div v-if="!categories || !liveObjectCache">
    Loading...
  </div>
  <div v-else>
    <HomeButton />
    <ActiveSearchButton />
    <h4>Categories {{ uniqueExternalCategories ? '(' + uniqueExternalCategories.length + ')' : '' }}</h4>
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
            <ExcludeCategoryButton :category="externalCategory.category" @exclude="excludeCategory(externalCategory.category)"/>
            <IncludeCategoryButton :category="externalCategory.category" @include="includeCategory(externalCategory, index)"/>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>