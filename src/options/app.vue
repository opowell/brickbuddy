<script setup lang="ts">
import { importRbPartsToMemory, loadModels } from './idb/idb';
import { startFetching } from './idb/scraping';

onMounted(async () => {
  await importRbPartsToMemory()
  await loadModels()
  startFetching()
})
</script>
<template>
  <router-view />
</template>
