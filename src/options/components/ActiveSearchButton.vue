<script setup lang="ts">
import { Crumbs } from '../constants';
import { useRouter } from 'vue-router'
import { ActiveSearch } from '../types';
import { getActiveSearch } from '../idb';
const router = useRouter()
const activeSearch = ref<ActiveSearch | undefined>(undefined)
onMounted(() => {
  activeSearch.value = getActiveSearch()
})
const showButton = computed(() => {
  if (!activeSearch.value) {
    return false
  }
  if (activeSearch.value.categories.ids.length > 0) {
    return true
  }
  if (activeSearch.value.colors.ids.length > 0) {
    return true
  }
  if (activeSearch.value.parts.ids.length > 0) {
    return true
  }
  if (activeSearch.value.stores.ids.length > 0) {
    return true
  }
  return false
})
</script>

<template>
  <button v-if="activeSearch && showButton" @click="router.push(Crumbs.activeSearch.href)">
    Active search:
    <span v-if="activeSearch.categories.ids.length > 0">{{ activeSearch.categories.ids.length }} {{ activeSearch.categories.excluded ? 'excluded' : 'included' }} categories</span>
    <span v-if="activeSearch.colors.ids.length > 0">{{ activeSearch.colors.ids.length }} {{ activeSearch.colors.excluded ? 'excluded' : 'included' }} colors</span>
    <span v-if="activeSearch.parts.ids.length > 0">{{ activeSearch.parts.ids.length }} {{ activeSearch.parts.excluded ? 'excluded' : 'included' }} parts</span>
    <span v-if="activeSearch.stores.ids.length > 0">{{ activeSearch.stores.ids.length }} {{ activeSearch.stores.excluded ? 'excluded' : 'included' }} stores</span>
  </button>
</template>