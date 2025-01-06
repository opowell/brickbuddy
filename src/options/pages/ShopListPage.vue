<script setup lang="ts">
import { Search, ShopListItem, Store, type ShopList, type UiListItem } from "../types";
import {
  externalPartImagesMap,
  loadExternalPartImage,
} from "../idb/categories";

import { useRoute } from "vue-router";
const route = useRoute();
import { liveObjectCache } from "../idb/idb";
const list = ref<ShopList | undefined>();
const search = ref<Search | undefined>();
const listItems = ref<ShopListItem[] | undefined>()
const stores = ref<Store[] | undefined>()
onMounted(async () => {
  search.value = await liveObjectCache.getActiveSearch()
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
import { getListPageStores } from "../idb/storeMethods";
import { formatAmount, formatFloat } from "../utils";
import SearchSelect from "../components/SearchSelect.vue";
import StoreButton from "../components/StoreButton.vue";
const totalCosts = computed(() => {
  const map = new Map<string, number>()
  if (!liveObjectCache.listItemStorePriceMap) {
    return map
  }
  if (!stores.value) {
    return map
  }
  const itemValues = items.value
  if (!itemValues) {
    return map
  }
  stores.value.forEach((store) => {
    let value = 0
    itemValues.forEach((item) => {
      const price = liveObjectCache.listItemStorePriceMap.value.get(item.externalItem.type + item.itemId + store.id)
      if (!price) {
        return
      }
      value += price * item.minQuantity
    })
    map.set(store.id, value)
  })
  return map
})
const matchedItems = computed(() => {
  const map = new Map<string, number>()
  if (!liveObjectCache.listItemStorePriceMap) {
    return map
  }
  if (!stores.value) {
    return map
  }
  const itemValues = items.value
  if (!itemValues) {
    return map
  }
  stores.value.forEach((store) => {
    let value = 0
    itemValues.forEach((item) => {
      const price = liveObjectCache.listItemStorePriceMap.value.get(item.externalItem.type + item.itemId + store.id)
      if (!price) {
        return
      }
      value++
    })
    map.set(store.id, 100 * value / itemValues.length)
  })
  return map
})
import ListSelect from "../components/ListSelect.vue";
import ListButton from "../components/ListButton.vue";
import SearchButton from "../components/SearchButton.vue";
</script>

<template>
  <div v-if="list && liveObjectCache">
    <h4>Shop list</h4>
    <p>List: <ListButton :list /><ListSelect /><button>Set</button></p>
    <p>Search: <SearchButton :search /><SearchSelect /><button>Set</button></p>
    <table>
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th
            v-for="item in items"
            :key="`${item.itemId}-${item.condition}-${item.colors}`"
          >
            <input type="checkbox" />
          </th>
        </tr>
        <tr>
          <th></th>
          <th><button>Store</button></th>
          <th><button>Total cost</button></th>
          <th><button>Match %</button></th>
          <th
            v-for="item in items"
            :key="`${item.itemId}-${item.condition}-${item.colors}`"
          >
            <img
              v-if="externalPartImagesMap.get(item.externalItem.type + item.itemId)"
              :src="externalPartImagesMap.get(item.externalItem.type + item.itemId)"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="store in stores" :key="store.id">
          <td><input type="checkbox" /></td>
          <td><StoreButton :store="store" /></td>
          <td>{{ formatAmount(totalCosts.get(store.id)) }}</td>
          <td>{{ formatFloat(matchedItems.get(store.id)) }}</td>
          <td v-for="item in items" :key="store.id + '---' + item.itemId">
            <template
              v-if="
                liveObjectCache.listItemStorePriceMap.value.get(
                  item.externalItem.type + item.itemId + store.id
                )
              "
            >
              <button>
                {{
                  formatAmount(
                    liveObjectCache.listItemStorePriceMap.value.get(
                      item.externalItem.type + item.itemId + store.id
                    )
                  )
                }}
              </button>
            </template>
            <template v-else> - </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style lang="css" scoped>
th {
  position: sticky;
  top: 0;
  background-color: #f9f8f8;
}
</style>
