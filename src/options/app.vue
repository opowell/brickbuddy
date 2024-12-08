<script setup lang="ts">
import { createActiveSearchIfNecessary, getDbConnection, importRbPartsToMemory, loadObjectCache } from './idb/idb';
import { startFetching } from './idb/scraping';
import { objectCache } from './idb/idb';

onMounted(async () => {
  await importRbPartsToMemory()
  const db = await getDbConnection()
  await loadObjectCache(db)
  await createActiveSearchIfNecessary(db)
  // startFetching()
  return {
    objectCache
  }
})

import { watch } from "vue";
import { useRoute } from "vue-router";

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
  <router-view />
</template>
