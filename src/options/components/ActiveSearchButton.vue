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
  return text.value.length > 0
})
const text = computed(() => {
  const search = activeSearch.value
  if (!search) {
    return ''
  }
  const texts: string[] = []
  const fields = ['categories', 'colors', 'parts', 'conditions']
  fields.forEach(field => {
    const searchField: { ids: string[], excluded: boolean } = search[field]
    if (searchField.ids.length > 0) {
      texts.push(searchField.ids.length + ' ' + (searchField.excluded ? 'excluded' : 'included') + ' ' + field)
    }
  })
  return texts.join(', ')
})
</script>

<template>
  <button v-if="activeSearch && showButton" @click="router.push(Crumbs.activeSearch.href)">
    {{ text }}
  </button>
</template>