<script setup lang="ts">
import { cacheLoaded, createActiveSearchIfNecessary, getDbConnection, importRbPartsToMemory, loadLiveObjectCache } from './idb/idb';
import { startFetching } from './idb/scraping';

onMounted(async () => {
  await importRbPartsToMemory()
  const db = await getDbConnection()
  await loadLiveObjectCache(db)
  await createActiveSearchIfNecessary(db)
  // await addStore("brickina - up to 75%OFF", "875831", [], 'brickina', 100, db)
  // startFetching()
  return {
    cacheLoaded,
  }
})

import { watch } from "vue";
import { useRoute } from "vue-router";
import { addStore } from './idb/storeMethods';

const route = useRoute();

// do a `console.log(route)` to see route attributes (fullPath, hash, params, path...)
watch(
  () => route.fullPath,
  async () => {
    window.scrollTo({ left: 0, top: 0 })
  }
);


// @ts-ignore
window.getUsage = async function() {
  if (!navigator.storage || !navigator.storage.estimate) {
    return
  }
  const quota = await navigator.storage.estimate();
  if (!quota.usage || !quota.quota) {
    return
  }
  const percentageUsed = (quota.usage / quota.quota) * 100;
  const quotaInGB = (quota.quota / 1024/1024/1024).toFixed(2)
  const usageInGB = (quota.usage / 1024/1024/1024).toFixed(2)
  const remaining = Number.parseFloat(quotaInGB) - Number.parseFloat(usageInGB)
  console.log(`Quota: ${quotaInGB} GB`)
  console.log(`Usage: ${usageInGB} GB`)
  console.log(`Usage %: ${percentageUsed}`)
  console.log(`Remaining: ${remaining} GB`);
}


</script>
<template>
  <router-view v-if="cacheLoaded" />
</template>
