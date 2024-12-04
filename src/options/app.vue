<script setup lang="ts">
import { getDbConnection, importRbPartsToMemory, loadActiveSearch, loadObjectCache } from './idb/idb';
import { startFetching } from './idb/scraping';
import { objectCache } from './idb/idb';

onMounted(async () => {
  await importRbPartsToMemory()
  // startFetching()
  await loadActiveSearch()
  const db = await getDbConnection()
  await loadObjectCache(db)
  return {
    objectCache
  }
})

</script>
<template>
  <router-view />
</template>
