<script setup lang="ts">
import {
  CategoriesPageCategory,
  CategoriesPageExternalCategory,
  Category,
  ExternalCategory,
  SearchFilter,
} from "../types";
import ExcludeCategoryButton from "../components/ExcludeCategoryButton.vue";
import IncludeCategoryButton from "../components/IncludeCategoryButton.vue";
import { getDbConnection, liveObjectCache } from "../idb/idb";
import ObjectCache from "../idb/ObjectCacheClass";
interface CategoriesPageUniqueCategory {
  externalCategories: CategoriesPageExternalCategory[];
  isExternal: boolean;
  numParts: number;
  image?: string;
  id: number | string;
  category: CategoriesPageCategory;
}
// @ts-ignore
function countUnique(iterable: Iterable) {
  return new Set(iterable).size;
}
const categories = ref<CategoriesPageCategory[] | undefined>(undefined);
const computedCategories = computed<CategoriesPageCategory[] | undefined>(() => {
  return categories.value;
});
const categoryImageMap = computed(() => {
  return new Map();
  // if (!liveObjectCache.computedCache.linked) {
  //   return;
  // }
  // return liveObjectCache.computedCache.categoryImageMap.value;
});
const externalCategoryImageMap = computed(() => {
  return new Map();
  // if (!liveObjectCache.computedCache.linked) {
  //   return;
  // }
  // return liveObjectCache.computedCache.externalCategoryImageMap.value;
});
onMounted(async () => {
  const db = await getDbConnection();
  const objectCache = new ObjectCache(db);
  categories.value = await objectCache.getCategoriesPageCategories2();
});
const uniqueExternalCategories = computed<CategoriesPageUniqueCategory[]>(() => {
  if (!computedCategories.value) {
    return [];
  }
  const out: CategoriesPageUniqueCategory[] = [];
  computedCategories.value.forEach((category) => {
    const types = category.externalCategories.map((ec) => ec.type);
    if (countUnique(types) < types.length) {
      // add each ec individually
      category.externalCategories.forEach((ec) => {
        if (ec.numParts === 0) {
          return;
        }
        const image = externalCategoryImageMap.value?.get(ec.id);
        out.push({
          isExternal: true,
          externalCategories: [ec],
          numParts: ec.numParts,
          image,
          id: ec.id,
          category,
        });
      });
    } else {
      // add all ec together
      const numParts = category.externalCategories.reduce(
        (sum, currentValue) => sum + currentValue.numParts,
        0
      );
      const image = categoryImageMap.value?.get(category.id);
      out.push({
        isExternal: false,
        externalCategories: category.externalCategories,
        numParts,
        image,
        id: category.id,
        category,
      });
    }
  });
  return out;
});
async function excludeCategory(category: Category) {
  return await filterCategory(category, true);
}
async function includeCategory(category: Category) {
  return await filterCategory(category, false);
}
async function filterCategory(category: Category, isExcluded: boolean) {
  const search = await getActiveSearch();
  if (!search) {
    return;
  }
  const filter: SearchFilter = {
    searchId: search.id,
    type: "category",
    isExcluded,
    objectId: category.id,
  };
  put(liveObjectCache.db, stores.SEARCH_FILTERS, filter);
  category.excluded = isExcluded;
  put(liveObjectCache.db, stores.CATEGORIES, category);
}
import CategoryButton from "../components/CategoryButton.vue";
import HomeButton from "../components/HomeButton.vue";
import ActiveSearchButton from "../components/ActiveSearchButton.vue";
import ExternalCategoryButton from "../components/ExternalCategoryButton.vue";
import { getActiveSearch } from "../idb/searches";
import { put } from "../idb/db";
import stores from "../idb/stores";
import { reportTime, startTimer } from "../utils";
</script>

<template>
  <div v-if="!categories">Loading...</div>
  <div v-else>
    <HomeButton />
    <ActiveSearchButton />
    <h4>
      Categories
      {{ uniqueExternalCategories ? "(" + uniqueExternalCategories.length + ")" : "" }}
    </h4>
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
          <td><img v-if="externalCategory.image" :src="externalCategory.image" /></td>
          <td>
            <ExternalCategoryButton
              v-if="externalCategory.isExternal"
              :category="externalCategory.externalCategories[0]"
            />
            <CategoryButton v-else :category="externalCategory.category" />
          </td>
          <td>
            {{ externalCategory.numParts }}
          </td>
          <td>
            <ExcludeCategoryButton
              :category="externalCategory.category"
              @exclude="excludeCategory(externalCategory.category)"
            />
            <IncludeCategoryButton
              :category="externalCategory.category"
              @include="includeCategory(externalCategory.category)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
