<script setup lang="ts">
import { liveObjectCache } from "../idb/idb";
import { ShopList } from "../types";

const lists = ref<ShopList[] | undefined>();
onMounted(async () => {
  lists.value = await liveObjectCache.getAllLists();
});
const selected = ref();
</script>

<template>
  <select v-if="lists" v-model="selected">
    <option v-for="list in lists" :value="list.id">
      {{ list.name }}
    </option>
  </select>
</template>
