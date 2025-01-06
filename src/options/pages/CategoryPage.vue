<script setup lang="ts">
import { Crumbs } from "../idb/constants";
import HomeButton from "../components/HomeButton.vue";

import { useRoute } from "vue-router";
import { getCategoryPageCategory } from "../idb/categories";
import { CategoryPageCategory, CategoryPagePart, ShopListItem } from "../types";
import IncludeCategoryButton from "../components/IncludeCategoryButton.vue";
import ExcludeCategoryButton from "../components/ExcludeCategoryButton.vue";
const route = useRoute();
import { useRouter } from "vue-router";
import PartButton from "../components/PartButton.vue";
const router = useRouter();
const category = ref<CategoryPageCategory | undefined>();
onMounted(async () => {
  category.value = await getCategoryPageCategory(route.params.id - 0);
  listItemQuantityMap = liveObjectCache.listExternalItemQuantityMap;
});
const parts = computed(() => {
  if (!category.value) {
    return [];
  }
  return category.value.parts;
});
import ExternalCategoryButton from "../components/ExternalCategoryButton.vue";
import QuantityInput from "../components/QuantityInput.vue";
import { liveObjectCache } from "../idb/idb";
let listItemQuantityMap = ref<Map<string, number>>();
function updateListQuantity(item: CategoryPagePart, quantity: number) {
  const listItem: ShopListItem = {
    listId: listId.value,
    itemId: item.externalParts[0].externalItemId,
    type: "externalItem",
    colors: [],
    minQuantity: quantity,
  };
  put(liveObjectCache.db, stores.LIST_ITEMS, listItem);
  if (!listItemQuantityMap.value) {
    return;
  }
  listItemQuantityMap.value.set(
    listId.value + "-" + item.externalParts[0].externalItemId,
    quantity
  );
}
import ListSelect from "../components/ListSelect.vue";
import stores from "../idb/stores";
import { put } from "../idb/db";
const listId = ref();
function selectList(id: string) {
  listId.value = id;
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
watch(loadPartsTrigger, () => {
  parts.value.forEach((part) => {
    liveObjectCache.loadListExternalItemQuantity(
      listId.value,
      part.externalParts[0].externalItemId
    );
  });
});
</script>

<template>
  <div v-if="category">
    <h4>Category {{ category.id }}</h4>
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
          <th>List <ListSelect @select="selectList" /></th>
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
              v-if="listId && listItemQuantityMap"
              :current="
                listItemQuantityMap.get(
                  listId + '-' + part.externalParts[0].externalItemId
                )
              "
              @update-quantity="updateListQuantity(part, $event)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else>No category.</div>
</template>
