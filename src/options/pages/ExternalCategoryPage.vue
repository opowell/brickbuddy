<script setup lang="ts">
import { Crumbs } from "../idb/constants";
import CategoriesButton from "../components/CategoriesButton.vue";
import CategoryButton from "../components/CategoryButton.vue";
import HomeButton from "../components/HomeButton.vue";

import { useRoute } from "vue-router";
import {
  ExternalCategoryPageExternalCategory,
  ExternalCategoryPageExternalPart,
} from "../types";
import IncludeCategoryButton from "../components/IncludeCategoryButton.vue";
import ExcludeCategoryButton from "../components/ExcludeCategoryButton.vue";
const route = useRoute();
import { useRouter } from "vue-router";
import { formatAmount, formatInteger, reportTime, startTimer } from "../utils";
import ActiveSearchButton from "../components/ActiveSearchButton.vue";
import ExternalPartButton from "../components/ExternalPartButton.vue";
import {
  externalPartPriceMap,
  externalPartNumInvItemsMap,
  externalPartNumVariantsMap,
  externalPartImagesMap,
  getExternalCategoryPageExternalCategory,
} from "../idb/categories";
import ActiveCartButton from "../components/ActiveCartButton.vue";
startTimer("ExternalCategoryPage");
const router = useRouter();
const category = ref<ExternalCategoryPageExternalCategory>();
onMounted(async () => {
  category.value = await getExternalCategoryPageExternalCategory(
    route.params.type,
    route.params.id
  );
  reportTime("ExternalCategoryPage");
});
const sortedParts = computed<ExternalCategoryPageExternalPart[]>(() => {
  if (!category.value) {
    return [];
  }
  const sorted = category.value.externalParts.sort((a, b) => {
    if (!a.name) {
      return 1;
    }
    if (!b.name) {
      return -1;
    }
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
  return sorted;
});
</script>

<template>
  <div>
    <HomeButton />
    <CategoriesButton />
    <ActiveSearchButton />
    <ActiveCartButton />
    <div v-if="!category">Loading...</div>
    <div v-else>
      <h4>
        External category: {{ category.type }} {{ category.name }} ({{ category.id }})
      </h4>
      <IncludeCategoryButton
        :category="category"
        @include="router.push(Crumbs.categories.href)"
      />
      <ExcludeCategoryButton
        :category="category"
        @exclude="router.push(Crumbs.categories.href)"
      />
      <div>Category: <CategoryButton :category="category.category" /></div>
      <h4>Parts ({{ category.externalParts.length }})</h4>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Colors</th>
            <th>Inv. items</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="part in sortedParts" :key="part.itemId">
            <td>
              <img
                v-if="externalPartImagesMap.get(part.type + part.externalItemId)"
                :src="externalPartImagesMap.get(part.type + part.externalItemId)"
              />
            </td>
            <td>
              <ExternalPartButton :part="part" />
            </td>
            <td>
              {{
                formatInteger(
                  externalPartNumVariantsMap.get(part.type + part.externalItemId)
                )
              }}
            </td>
            <td>
              {{
                formatInteger(
                  externalPartNumInvItemsMap.get(part.type + part.externalItemId)
                )
              }}
            </td>
            <td>{{ formatAmount(externalPartPriceMap.get(part.type + part.itemId)) }}</td>
            <td><button>Add to list</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
