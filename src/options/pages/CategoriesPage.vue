<script setup lang="ts">
import {
  CategoriesPageCategory,
  CategoriesPageExternalCategory,
  Category,
  ExternalCategory,
  SearchFilter,
} from "../types";
import { getDbConnection, liveObjectCache } from "../idb/idb";
import ObjectCache from "../idb/ObjectCacheClass";
import FilterButtons from "../components/FilterButtons.vue";
interface CategoriesPageUniqueCategory {
  externalCategories: CategoriesPageExternalCategory[];
  isExternal: boolean;
  numParts: number;
  image?: string;
  id: number | string;
  category: CategoriesPageCategory;
  included: boolean;
  excluded: boolean;
}
// @ts-ignore
function countUnique(iterable: Iterable) {
  return new Set(iterable).size;
}
const categories = ref<CategoriesPageCategory[] | undefined>(undefined);
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
  if (!categories.value) {
    return [];
  }
  const out: CategoriesPageUniqueCategory[] = [];
  categories.value.forEach((category) => {
    const types = category.externalCategories.map((ec) => ec.type);
    if (countUnique(types) < types.length) {
      // add each ec individually
      category.externalCategories.forEach((ec) => {
        if (ec.numParts === 0) {
          return;
        }
        const image = externalCategoryImageMap.value?.get(ec.id) || ec.image;
        out.push({
          isExternal: true,
          externalCategories: [ec],
          numParts: ec.numParts,
          image,
          id: ec.id,
          category,
          included: false,
          excluded: false,
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
        included: false,
        excluded: false,
      });
    }
  });
  return out;
});
async function exclude(externalCategory: CategoriesPageUniqueCategory) {
  return await filterCategory(externalCategory, true);
}
async function include(externalCategory: CategoriesPageUniqueCategory) {
  return await filterCategory(externalCategory, false);
}
async function filterCategory(
  externalCategory: CategoriesPageUniqueCategory,
  isExcluded: boolean
) {
  const search = await getActiveSearch();
  if (!search) {
    return;
  }
  const filter: SearchFilter = {
    searchId: search.id,
    type: "category",
    isExcluded,
    objectId: externalCategory.id,
  };
  put(liveObjectCache.db, stores.SEARCH_FILTERS, filter);
  externalCategory.excluded = isExcluded;
  externalCategory.included = !isExcluded;
}
import CategoryButton from "../components/CategoryButton.vue";
import HomeButton from "../components/HomeButton.vue";
import ActiveSearchButton from "../components/ActiveSearchButton.vue";
import ExternalCategoryButton from "../components/ExternalCategoryButton.vue";
import { getActiveSearch } from "../idb/searches";
import { dbDelete, getAllFromIndex, put } from "../idb/db";
import stores from "../idb/stores";
import { reportTime, startTimer } from "../utils";
import indices from "../idb/indices";

async function clear(category: CategoriesPageUniqueCategory) {
  const search = await getActiveSearch();
  if (!search) {
    return;
  }
  dbDelete(liveObjectCache.db, stores.SEARCH_FILTERS, [
    search.id,
    "storeCountry",
    category.id,
  ]);
  category.excluded = false;
  category.included = false;
  const categories = await getAllFromIndex<ExternalCategory>(
    liveObjectCache.db,
    indices.EXTERNAL_CATEGORIES_BY_CATEGORY,
    category.id
  );
  if (!categories) {
    return;
  }
  for (let i = 0; i < categories.length; i++) {
    await dbDelete(liveObjectCache.db, stores.SEARCH_CATEGORIES, [
      search.id,
      categories[i].id,
    ]);
  }
}
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
          <th>Types</th>
          <th>Names</th>
          <th>Parts</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(externalCategory, index) in uniqueExternalCategories" :key="index">
          <td><img v-if="externalCategory.image" :src="externalCategory.image" /></td>
          <td>
            <span v-for="ec in externalCategory.externalCategories">
              <button>{{ ec.type }}</button>
            </span>
          </td>
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
            <FilterButtons
              :included="externalCategory.included"
              :excluded="externalCategory.excluded"
              @include="include(externalCategory)"
              @exclude="exclude(externalCategory)"
              @clear="clear(externalCategory)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
