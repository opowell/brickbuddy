<script setup lang="ts">
import { liveObjectCache } from "../idb/idb";
import { ShopList } from "../types";

const lists = ref<ShopList[] | undefined>();
onMounted(async () => {
  lists.value = await liveObjectCache.getAllLists();
  if (!lists.value || lists.value.length < 1) {
    return;
  }
  selectedId.value = lists.value[0].id;
});
const selectedId = ref();
const emit = defineEmits(["select"]);
watch(
  () => selectedId.value,
  () => {
    if (!selectedId.value) {
      return;
    }
    emit("select", selectedId.value);
  }
);
</script>

<template>
  <select v-if="lists" v-model="selectedId">
    <option :selected="list.id === selectedId" v-for="list in lists" :value="list.id">
      {{ list.name }}
    </option>
  </select>
</template>
