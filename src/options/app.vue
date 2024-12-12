<script setup lang="ts">
import { cacheLoaded, createActiveSearchIfNecessary, getDbConnection, importRbPartsToMemory, loadLiveObjectCache } from './idb/idb';
import { startFetching } from './idb/scraping';

onMounted(async () => {
  await importRbPartsToMemory()
  const db = await getDbConnection()
  await loadLiveObjectCache(db)
  await createActiveSearchIfNecessary(db)
  // await addStore("Vineyard Bricks e.U.", "1821152", [], 'jgutzwar97', 100, db)
  startFetching()
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

</script>
<template>
  <router-view v-if="cacheLoaded" />
</template>
