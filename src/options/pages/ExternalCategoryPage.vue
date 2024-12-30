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
const route = useRoute();
import { useRouter } from "vue-router";
import { formatAmount, formatInteger, reportTime, startTimer } from "../utils";
import ExternalPartButton from "../components/ExternalPartButton.vue";
import {
  externalPartPriceMap,
  externalPartNumInvItemsMap,
  externalPartNumVariantsMap,
  externalPartImagesMap,
  getExternalCategoryPageExternalCategory,
} from "../idb/categories";
import FilterButtons from "../components/FilterButtons.vue";
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
    switch (sorting.value) {
      case SORTINGS.InvItems: {
        const qA = externalPartNumInvItemsMap.value.get(a.type + a.externalItemId);
        const qB = externalPartNumInvItemsMap.value.get(b.type + b.externalItemId);
        if (qA === undefined && qB === undefined) {
          return 1;
        }
        if (qA === undefined) {
          return 0;
        }
        if (qB === undefined) {
          return 1;
        }
        return qB - qA;
      }
      case SORTINGS.Colors: {
        const qA = externalPartNumVariantsMap.value.get(a.type + a.externalItemId);
        const qB = externalPartNumVariantsMap.value.get(b.type + b.externalItemId);
        if (qA === undefined && qB === undefined) {
          return 1;
        }
        if (qA === undefined) {
          return 0;
        }
        if (qB === undefined) {
          return 1;
        }
        return qB - qA;
      }
      case SORTINGS.Price: {
        const qA = externalPartPriceMap.value.get(a.type + a.itemId);
        const qB = externalPartPriceMap.value.get(b.type + b.itemId);
        console.log("price", qA, qB);
        if (qA === undefined && qB === undefined) {
          return 1;
        }
        if (qA === undefined) {
          return 0;
        }
        if (qB === undefined) {
          return 1;
        }
        return qA - qB;
      }
      case SORTINGS.Name: {
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
      }
    }
  });
  return sorted;
});
enum SORTINGS {
  Name,
  InvItems,
  Colors,
  Price,
}
const sorting = ref(SORTINGS.Name);
function sortByInvItems() {
  sorting.value = SORTINGS.InvItems;
}
function sortByColors() {
  sorting.value = SORTINGS.Colors;
}
function sortByPrice() {
  sorting.value = SORTINGS.Price;
}
import { useFilterCategory } from "@/composables/filterCategory";
const { include, exclude, clear } = useFilterCategory();
</script>

<template>
  <div>
    <HomeButton />
    <CategoriesButton />
    <div v-if="!category">Loading...</div>
    <div v-else>
      <h4>
        External category: {{ category.type }} {{ category.name }} ({{ category.id }})
      </h4>
      <FilterButtons
        :included="category.included"
        :excluded="category.excluded"
        @include="include(category)"
        @exclude="exclude(category)"
        @clear="clear(category)"
      />
      <div>Category: <CategoryButton :category="category.category" /></div>
      <h4>Parts ({{ category.externalParts.length }})</h4>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th><button @click="sortByColors">Colors</button></th>
            <th><button @click="sortByInvItems">Store items</button></th>
            <th><button @click="sortByPrice">Price</button></th>
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
