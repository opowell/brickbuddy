<script setup lang="ts">
import { createActiveSearchIfNecessary, getDbConnection, importRbPartsToMemory, loadObjectCache } from './idb/idb';
import { startFetching } from './idb/scraping';
import { objectCache } from './idb/idb';

onMounted(async () => {
  await importRbPartsToMemory()
  // startFetching()
  const db = await getDbConnection()
  await loadObjectCache(db)
  await createActiveSearchIfNecessary(db)
  return {
    objectCache
  }
})

</script>
<template>
  <router-view />
</template>
