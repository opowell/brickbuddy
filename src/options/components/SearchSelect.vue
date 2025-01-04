<script setup lang="ts">
import { liveObjectCache } from "../idb/idb";
import { Search } from "../types";

const searches = ref<Search[] | undefined>();
onMounted(async () => {
  searches.value = await liveObjectCache.getSearches();
  if (!searches.value || searches.value.length < 1) {
    return;
  }
  selectedId.value = searches.value[0].id;
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
  <select v-if="searches" v-model="selectedId">
    <option :selected="list.id === selectedId" v-for="list in searches" :value="list.id">
      {{ list.name }}
    </option>
  </select>
</template>
