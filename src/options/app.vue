<script setup lang="ts">
import { startFetching, loadModels, importRbPartsToMemory, importRbCategories } from './idb/idb';
onMounted(async () => {
  await importRbPartsToMemory()
  await importRbCategories()
  await loadModels()
  startFetching()
})
</script>
<template>
  <router-view />
</template>
