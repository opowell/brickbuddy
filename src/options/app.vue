<script setup lang="ts">
import {
  createActiveSearchIfNecessary,
  getDbConnection,
  importRbPartsToMemory,
  liveObjectCache,
  loadLiveObjectCache,
} from "./idb/idb";
import { startFetching, startFetchingStores } from "./idb/scraping";

const loaded = ref(false);
onMounted(async () => {
  // startTimer("app.vue");
  await importRbPartsToMemory();
  const db = await getDbConnection();
  await loadLiveObjectCache(db);
  await createActiveSearchIfNecessary(liveObjectCache);
  // startFetchingStores();
  startFetching();
  loaded.value = true;
  // reportTime("app.vue");
  return {
    loaded,
  };
});

import { watch } from "vue";
import { useRoute } from "vue-router";
import { reportTime, startTimer } from "./utils";

const route = useRoute();

watch(
  () => route.fullPath,
  async () => {
    window.scrollTo({ left: 0, top: 0 });
  }
);

// @ts-ignore
window.getUsage = async function () {
  if (!navigator.storage || !navigator.storage.estimate) {
    return;
  }
  const quota = await navigator.storage.estimate();
  if (!quota.usage || !quota.quota) {
    return;
  }
  const percentageUsed = (quota.usage / quota.quota) * 100;
  const quotaInGB = (quota.quota / 1024 / 1024 / 1024).toFixed(2);
  const usageInGB = (quota.usage / 1024 / 1024 / 1024).toFixed(2);
  const remaining = Number.parseFloat(quotaInGB) - Number.parseFloat(usageInGB);
  console.log(`Quota: ${quotaInGB} GB`);
  console.log(`Usage: ${usageInGB} GB`);
  console.log(`Usage %: ${percentageUsed}`);
  console.log(`Remaining: ${remaining} GB`);
};
import ActiveSearchButton from "./components/ActiveSearchButton.vue";
import ActiveCartButton from "./components/ActiveCartButton.vue";
import HomeButton from "./components/HomeButton.vue";
import SearchesButton from "./components/SearchesButton.vue";
import ListsButton from "./components/ListsButton.vue";
import CartsButton from "./components/CartsButton.vue";
</script>
<template>
  <p v-if="loaded" class="cartButtonContainer">
    <HomeButton />
    <ActiveSearchButton />
    <span class="spacer" />
    <SearchesButton />
    <ListsButton />
    <CartsButton />
    <span class="spacer" />
    <ActiveCartButton />
  </p>
  <router-view v-if="loaded" />
</template>
<style lang="css" scoped>
.cartButtonContainer {
  display: flex;
  gap: 0.3rem;
}
.cartButtonContainer > * {
  flex-grow: 0;
}
.spacer {
  flex-grow: 1;
}
</style>
