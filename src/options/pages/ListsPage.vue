<script setup lang="ts">
import type { ShopList, UiShopList } from "../types";
import HomeButton from "../components/HomeButton.vue";
import { liveObjectCache } from "../idb/idb";
import { dbDelete, put } from "../idb/db";
import stores from "../idb/stores";
import ListButton from "../components/ListButton.vue";
const lists = ref<ShopList[] | undefined>();
const numItemsMap = ref<Map<number, number>>();
onMounted(async () => {
  lists.value = await liveObjectCache.getAllLists();
  numItemsMap.value = liveObjectCache.listsNumItemsMap;
  if (!lists.value) {
    return;
  }
  lists.value.forEach((list) => {
    liveObjectCache.loadNumListItems(list.id);
  });
});
function open(list: ShopList) {}
function add() {
  const db = liveObjectCache.db;
  put(db, stores.LISTS, {
    name: new Date().toISOString(),
  });
}
function deleteList(list: ShopList, index: number) {
  if (!list.id) {
    return;
  }
  dbDelete(liveObjectCache.db, stores.LISTS, list.id);
}
</script>

<template>
  <div>
    <HomeButton />
    <h4 v-if="lists">Lists ({{ lists.length }})</h4>
    <table v-if="lists">
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Items</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(list, index) in lists" :key="list.id">
          <td>{{ list.id }}</td>
          <td>
            <ListButton :list="list" />
          </td>
          <td v-if="list.id && numItemsMap">
            {{ numItemsMap.get(list.id) }}
          </td>
          <td>
            <button @click="deleteList(list, index)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="add">Add</button>
  </div>
</template>
