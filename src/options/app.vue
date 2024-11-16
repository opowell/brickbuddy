<script setup lang="ts">
import { startFetching, loadModels, importRbPartsExternal } from './idb/idb';
onMounted(async () => {
  await importRbPartsExternal()
  await loadModels()
  startFetching()
})
</script>
<template>
  <router-view />
</template>
