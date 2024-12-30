<script setup lang="ts">
import { ExternalItem, ShopListItem, type ShopList, type UiListItem } from "../types";
const emits = defineEmits(["open", "addItem", "goItem"]);
const newListItemItemId = ref("");
const newListItemCondition = ref("");
const newListItemMinQuantity = ref<number>(0);
const newListItemMaxQuantity = ref<number>(0);
const newListItemMaxPrice = ref<number>(0);
const newListItemColors = ref<number | null>(null);

import { useRoute } from "vue-router";
const route = useRoute();
import { liveObjectCache } from "../idb/idb";
const list = ref<ShopList | undefined>();
const listItems = ref<ShopListItem[] | undefined>()
onMounted(async () => {
  list.value = await liveObjectCache.getList(route.params.id - 0);
  if (!list.value) {
    return;
  }
  listItems.value = await liveObjectCache.getListItems(list.value.id)
});

function getColorNames(item: UiListItem) {
  if (!item || !item.colorNames) {
    return item.colors;
  }
  return item.colorNames.map((colorObj) => colorObj.name).join(",");
}
const sortedParts = computed(() => {
  if (!items.value) {
    return [];
  }
  return items.value.sort((a, b) => {
    return a.itemName > b.itemName ? 1 : -1;
  });
});
const filterString = ref("");
const filteredParts = computed(() => {
  const lowCaseFilter = filterString.value.toLowerCase();
  const lowCaseIdFilter = String(newListItemItemId.value).toLowerCase();
  return sortedParts.value.filter((a) => {
    return (
      a.itemName.toLowerCase().includes(lowCaseFilter) &&
      String(a.itemId).toLowerCase().includes(lowCaseIdFilter)
    );
  });
});
const items = computed(() => {
  if (!listItems.value) {
    return
  }
  return listItems.value.map(li => {
    const item = liveObjectCache.parts.get(li.itemId)
    if (!item) {
      return
    }
    return {
      ...li,
      itemName: item.itemId || '',
      variants: []
    }
  })
});
function setName(x: string) {
  if (!list.value) {
    return;
  }
  list.value.name = x;
  liveObjectCache.updateList(list.value);
}
import TextInput from "./TextInput.vue";
import HomeButton from "../components/HomeButton.vue";
import ListsButton from "../components/ListsButton.vue";
</script>

<template>
  <div v-if="list">
    <HomeButton />
    <ListsButton />
    <h4>List {{ list.name }}</h4>
    <div>Id: {{ list.id }}</div>
    <div>Name: <TextInput :value="list.name" @set="setName" /></div>
    <h4 v-if="items">Parts ({{ items.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Item</th>
          <th>Condition</th>
          <th>MinQ</th>
          <th>MaxQ</th>
          <th>MaxP</th>
          <th>Colors</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="`${item.itemId}-${item.condition}-${item.colors}`"
        >
          <td></td>
          <td>
            <button @click="$emit('goItem', item.item)">
              {{ item.itemName }} ({{ item.itemId }})
            </button>
          </td>
          <td>{{ item.condition }}</td>
          <td>{{ item.minQuantity }}</td>
          <td>{{ item.maxQuantity }}</td>
          <td>{{ item.maxPrice }}</td>
          <td>{{ getColorNames(item) }}</td>
        </tr>
      </tbody>
    </table>
    <h4>Filter</h4>
    <div>Item name:<input v-model="filterString" /></div>
    <div>Item Id:<input v-model="newListItemItemId" type="text" /></div>
    <div>
      Condition:<select v-model="newListItemCondition">
        <option value="New">New</option>
        <option value="Any">Any</option>
        <option value="Used">Used</option>
      </select>
    </div>
    <div>Min quantity:<input v-model="newListItemMinQuantity" type="number" /></div>
    <div>Max quantity:<input v-model="newListItemMaxQuantity" type="number" /></div>
    <div>Max price:<input v-model="newListItemMaxPrice" type="number" /></div>
    <div>Colors:<input v-model="newListItemColors" type="number" /></div>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Id</th>
          <th>Name</th>
          <th>Category</th>
          <th>Colors</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredParts" :key="item.itemId">
          <td><img v-if="item.variants.length" :src="item.variants[0].image" /></td>
          <td>{{ item.itemId }}</td>
          <td>
            <button @click="$emit('goItem', item)">
              {{ item.itemName }}
            </button>
          </td>
          <td>{{ item.categoryId }}</td>
          <td>{{ item.variants.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
