<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import { ActiveSearchButtonActiveSearch } from '../types';
import { getActiveSearchButtonActiveSearch } from '../idb/idb';
const router = useRouter()
const activeSearch = ref<ActiveSearchButtonActiveSearch | undefined>(undefined)
onMounted(async () => {
  activeSearch.value = await getActiveSearchButtonActiveSearch()
})
const showButton = computed(() => {
  if (!activeSearch.value) {
    return false
  }
  return text.value.length > 0
})
function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
const text = computed(() => {
  const search = activeSearch.value
  if (!search) {
    return ''
  }
  const texts: string[] = [
    'Price score: quantity: ' + search.priceScoreQuantity,
    'ignore color: ' + search.priceScoreIgnoreColor,
  ]
  const fields = ['categories', 'colors', 'parts', 'conditions']
  fields.forEach(field => {
    const searchField: { includedNames: string[], excludedNames: string[] } = search[field]
    if (searchField.includedNames.length > 0) {
      texts.push(capitalizeFirstLetter(field) + ': include ' + searchField.includedNames.join(', '))
    }
    if (searchField.excludedNames.length > 0) {
      texts.push(capitalizeFirstLetter(field) + ': exclude ' + searchField.excludedNames.join(', '))
    }
  })
  return 'Search: ' + texts.join('; ')
})
</script>

<template>
  <button v-if="activeSearch && showButton" @click="router.push(Crumbs.activeSearch.href)">
    {{ text }}
  </button>
</template>