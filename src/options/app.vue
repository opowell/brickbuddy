<script setup lang="ts">
import { importRbPartsToMemory } from './idb/idb';
import { startFetching } from './idb/scraping';

onMounted(async () => {
  await importRbPartsToMemory()
  // startFetching()
})
</script>
<template>
  <router-view />
</template>
