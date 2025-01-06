<script setup lang="ts">
import { ShopListItem, Store, type ShopList, type UiListItem } from "../types";
import {
  externalPartImagesMap,
  loadExternalPartImage,
} from "../idb/categories";

import { useRoute } from "vue-router";
const route = useRoute();
import { liveObjectCache } from "../idb/idb";
const list = ref<ShopList | undefined>();
const listItems = ref<ShopListItem[] | undefined>()
const stores = ref<Store[] | undefined>()
onMounted(async () => {
  list.value = await liveObjectCache.getList(route.params.id - 0);
  if (!list.value) {
    return;
  }
  listItems.value = await liveObjectCache.getListItems(list.value.id)
  if (!listItems.value) {
    return
  }
  listItems.value.forEach(li => {
    switch (li.type) {
      case 'externalItem': {
        // @ts-ignore
        const itemId: string = li.itemId
        liveObjectCache.loadExternalPart('BrickLink', itemId)
        loadExternalPartImage('BrickLink', itemId)
      }
    }
  })
  stores.value = await getListPageStores()
  if (!stores.value) {
    return
  }
  stores.value.forEach(store => {
    if (!listItems.value) {
      return
    }
    listItems.value.forEach(li => {
      switch (li.type) {
        case 'externalItem': {
          // @ts-ignore
          const itemId: string = li.itemId
          liveObjectCache.loadListItemStorePrice('BrickLink', itemId, store.id)
        }
      }
    })
  })
});

function getColorNames(item: UiListItem) {
  if (!item || !item.colorNames) {
    return item.colors;
  }
  return item.colorNames.map((colorObj) => colorObj.name).join(",");
}
const items = computed(() => {
  if (!listItems.value) {
    return
  }
  const out = []
  listItems.value.forEach(async (li) => {
    switch (li.type) {
      case 'item': {
        // @ts-ignore
        const item = liveObjectCache.parts.get(li.itemId)
        if (!item) {
          return
        }
        out.push({
          ...li,
          itemName: item.itemId || '',
          variants: []
        })
      }
      case 'externalItem': {
        const externalItem = liveObjectCache.externalPartsMap.value.get('BrickLink' + li.itemId)
        if (!externalItem) {
          return
        }
        out.push({
          ...li,
          itemName: externalItem.name || '',
          variants: [],
          externalItem
        })
      }
    }
  })
  return out
});
function setName(x: string) {
  if (!list.value) {
    return;
  }
  list.value.name = x;
  liveObjectCache.updateList(list.value);
}
import TextInput from "./TextInput.vue";
import ListsButton from "../components/ListsButton.vue";
import ExternalPartButton from "../components/ExternalPartButton.vue";
import { getListPageStores } from "../idb/storeMethods";
import QuantityInput from "../components/QuantityInput.vue";
import ShopListButton from "../components/ShopListButton.vue";
function updateQuantity(item, quantity: number) {
  console.log('update', item, quantity)
}
</script>

<template>
  <div v-if="list && liveObjectCache">
    <div style="display: flex; align-items: center; margin-bottom: 1rem">
      <ListsButton />&nbsp;-&nbsp;
      <div>{{ list.name }}</div>
    </div>
    <div>Id: {{ list.id }}</div>
    <div>Name: <TextInput :value="list.name" @set="setName" /></div>
    <p><ShopListButton :list="list" /></p>
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
          <td>
            <img
              v-if="externalPartImagesMap.get(item.externalItem.type + item.itemId)"
              :src="externalPartImagesMap.get(item.externalItem.type + item.itemId)"
            />
          </td>
          <td>
            <ExternalPartButton :part="item.externalItem" />
          </td>
          <td>{{ item.condition }}</td>
          <td>
            <QuantityInput
              :current="item.minQuantity"
              @update-quantity="updateQuantity(item, $event)"
            />
          </td>
          <td>{{ item.maxQuantity }}</td>
          <td>{{ item.maxPrice }}</td>
          <td>{{ getColorNames(item) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
