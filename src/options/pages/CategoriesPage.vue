<script setup lang="ts">
import { CategoriesPageCategory, CategoriesPageExternalCategory, Category, ExternalCategory } from '../types';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';

const categories = ref<CategoriesPageCategory[] | undefined>(undefined)
onMounted(async () => {
  categories.value = await getCategoriesPageCategories()
})
interface CategoriesPageUniqueCategory {
  externalCategories: ExternalCategory[]
  isExternal: boolean
  numParts: number
  image?: string
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
  categories.value.forEach(category => {
    const types = category.externalCategories.map(ec => ec.type)
    if (countUnique(types) < types.length) {
      // add each ec individually
      category.externalCategories.forEach(ec => {
        out.push({
          isExternal: true,
          externalCategories: [ec],
          numParts: ec.numParts,
          image: ec.image,
          id: ec.id,
          category
        })
      })
    } else {
      // add all ec together
      const numParts = category.externalCategories.reduce((sum, currentValue) => sum + currentValue.numParts, 0)
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
function excludeCategory(index: number) {
  categories.value?.splice(index, 1)
}
function includeCategory(index: number) {
  categories.value = categories.value?.splice(index, 1)
}
import CategoryButton from '../components/CategoryButton.vue';
import HomeButton from '../components/HomeButton.vue';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import { getCategoriesPageCategories } from '../idb/categories';
import ExternalCategoryButton from '../components/ExternalCategoryButton.vue';
</script>

<template>
  <div v-if="!categories">
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
          <th>External</th>
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
            {{ externalCategory.externalCategories.length }}
          </td>
          <td>
            {{ externalCategory.numParts }}
          </td>
          <td>
            <ExcludeCategoryButton :category="externalCategory.category" @exclude="excludeCategory(index)"/>
            <IncludeCategoryButton :category="externalCategory.category" @include="includeCategory(index)"/>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>