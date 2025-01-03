<script setup lang="ts">
import { Crumbs } from "../idb/constants";
import CategoriesButton from "../components/CategoriesButton.vue";
import CategoryButton from "../components/CategoryButton.vue";
import HomeButton from "../components/HomeButton.vue";

import { useRoute } from "vue-router";
import {
  ExternalCategoryPageExternalCategory,
  ExternalCategoryPageExternalPart,
  ShopListItem,
} from "../types";
const route = useRoute();
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
const category = ref<ExternalCategoryPageExternalCategory>();
onMounted(async () => {
  category.value = await getExternalCategoryPageExternalCategory(
    route.params.type,
    route.params.id
  );
  listExternalItemQuantityMap = liveObjectCache.listExternalItemQuantityMap;
});
const parts = computed(() => {
  if (!category.value) {
    return;
  }
  return category.value.externalParts;
});
const sortedParts = computed<ExternalCategoryPageExternalPart[]>(() => {
  if (!parts.value) {
    return [];
  }
  const sorted = parts.value.sort((a, b) => {
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
const listId = ref();
function selectList(id: string) {
  listId.value = id;
}
import ListSelect from "./ListSelect.vue";
import QuantityInput from "../components/QuantityInput.vue";
import { put } from "../idb/db";
import { liveObjectCache } from "../idb/idb";
import stores from "../idb/stores";
let listExternalItemQuantityMap: Ref<Map<string, number>> | undefined;
async function updateListQuantity(
  item: ExternalCategoryPageExternalPart,
  quantity: number
) {
  const listItem: ShopListItem = {
    listId: listId.value,
    itemId: item.externalItemId,
    type: "externalItem",
    colors: [],
    minQuantity: quantity,
  };
  await put(liveObjectCache.db, stores.LIST_ITEMS, listItem);
  await liveObjectCache.loadListExternalItemQuantity(listId.value, item.externalItemId);
}
const loadPartsTrigger = computed(() => {
  if (!listId.value) {
    return;
  }
  if (!parts.value) {
    return;
  }
  return listId.value + "-" + parts.value.map((p) => p.itemId).join(",");
});
watch(
  loadPartsTrigger,
  () => {
    if (!parts.value) {
      return;
    }
    parts.value.forEach((part) => {
      console.log("load", listId.value, part.externalItemId);
      liveObjectCache.loadListExternalItemQuantity(listId.value, part.externalItemId);
    });
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div>
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
            <th>List <ListSelect @select="selectList" /></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="part in sortedParts" :key="part.externalItemId">
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
            <td>
              <template v-if="listId && listExternalItemQuantityMap">
                <QuantityInput
                  :current="
                    listExternalItemQuantityMap.get(listId + '-' + part.externalItemId)
                  "
                  @update-quantity="updateListQuantity(part, $event)"
                />
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
