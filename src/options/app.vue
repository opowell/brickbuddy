<script setup lang="ts">
import { startFetching, loadModels } from './idb';
onMounted(() => {
  loadModels()
  startFetching()
})
</script>
<template>
  <router-view />
</template>
