<script setup lang="ts">
import { Crumbs } from "../idb/constants";
import CategoriesButton from "../components/CategoriesButton.vue";
import HomeButton from "../components/HomeButton.vue";

import { useRoute } from "vue-router";
import { getCategoryPageCategory } from "../idb/categories";
import { CategoryPageCategory, Item, Search } from "../types";
import IncludeCategoryButton from "../components/IncludeCategoryButton.vue";
import ExcludeCategoryButton from "../components/ExcludeCategoryButton.vue";
const route = useRoute();
import { useRouter } from "vue-router";
import ActiveSearchButton from "../components/ActiveSearchButton.vue";
import PartButton from "../components/PartButton.vue";
const router = useRouter();
const category = ref<CategoryPageCategory | undefined>();
startTimer("CategoryPage");
onMounted(async () => {
  category.value = await getCategoryPageCategory(route.params.id - 0);
  reportTime("CategoryPage");
  listItemQuantityMap.value = liveObjectCache.listItemQuantityMap;
  search.value = await liveObjectCache.getActiveSearch();
});
const parts = computed(() => {
  if (!category.value) {
    return [];
  }
  return category.value.parts;
});
import ExternalCategoryButton from "../components/ExternalCategoryButton.vue";
import { reportTime, startTimer } from "../utils";
import QuantityInput from "../components/QuantityInput.vue";
import { liveObjectCache } from "../idb/idb";
const listItemQuantityMap = ref<Map<string, number> | undefined>();
const search = ref<Search | undefined>();
function updateListQuantity(item: Item, quantity: number) {}
import ListSelect from "./ListSelect.vue";
</script>

<template>
  <div v-if="category">
    <HomeButton />
    <CategoriesButton />
    <ActiveSearchButton />
    <h4>{{ category.id }}</h4>
    <IncludeCategoryButton
      :category="category"
      @include="router.push(Crumbs.categories.href)"
    />
    <ExcludeCategoryButton
      :category="category"
      @exclude="router.push(Crumbs.categories.href)"
    />
    <h4>External categories</h4>
    <div v-for="externalCategory in category.externalCategories">
      <ExternalCategoryButton :category="externalCategory" />
    </div>
    <h4>Parts ({{ parts.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Colors</th>
          <th>Inv. items</th>
          <th>List <ListSelect /></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="part in parts" :key="part.itemId">
          <td><img v-if="part.image" :src="part.image" /></td>
          <td>
            <PartButton :part="part" />
          </td>
          <td>{{ part.numVariants }}</td>
          <td>{{ part.numInvItems }}</td>
          <td>
            <QuantityInput
              v-if="search && listItemQuantityMap"
              :current="listItemQuantityMap.get(search.id + '-' + part.itemId)"
              @update-quantity="updateListQuantity(part, $event)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else>No category.</div>
</template>
