<script setup lang="ts">
import { cacheLoaded, createActiveSearchIfNecessary, getDbConnection, importRbPartsToMemory, loadLiveObjectCache, loadObjectCache, setScores } from './idb/idb';
import { startFetching } from './idb/scraping';
import { objectCache } from './idb/idb';

onMounted(async () => {
  startTimer('app.vue')
  await importRbPartsToMemory()
  const db = await getDbConnection()
  // await loadObjectCache(db)
  await loadLiveObjectCache(db)
  await createActiveSearchIfNecessary(db)
  // startFetching()
  reportTime('app.vue')
  return {
    cacheLoaded,
    objectCache
  }
})

import { watch } from "vue";
import { useRoute } from "vue-router";
import { reportTime, startTimer } from './utils';

const route = useRoute();

// do a `console.log(route)` to see route attributes (fullPath, hash, params, path...)
watch(
  () => route.fullPath,
  async () => {
    window.scrollTo({ left: 0, top: 0 })
  }
);

</script>
<template>
  <router-view v-if="cacheLoaded" />
</template>
