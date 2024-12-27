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
</script>
<template>
  <router-view v-if="loaded" />
</template>
