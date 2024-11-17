<script setup lang="ts">
import { startFetching, loadModels, importRbPartsToMemoery, importRbCategories } from './idb/idb';
onMounted(async () => {
  await importRbPartsToMemoery()
  await loadModels()
  startFetching()
})
</script>
<template>
  <router-view />
</template>
