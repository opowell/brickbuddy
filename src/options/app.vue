<script setup lang="ts">
import { startFetching, loadModels, importRbParts, importRbCategories } from './idb/idb';
onMounted(async () => {
  await importRbParts()
  // await importRbCategories()
  await loadModels()
  // startFetching()
})
</script>
<template>
  <router-view />
</template>
