<script setup lang="ts">
import { Crumbs } from '../constants';
import { useRouter } from 'vue-router'
import { ActiveSearchButtonActiveSearch } from '../types';
import { getActiveSearchButtonActiveSearch } from '../idb';
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
  const texts: string[] = []
  const fields = ['categories', 'colors', 'parts', 'conditions']
  fields.forEach(field => {
    const searchField: { ids: string[], excluded: boolean } = search[field]
    if (searchField.ids.length > 0) {
      // texts.push(searchField.ids.length + ' ' + (searchField.excluded ? 'excluded' : 'included') + ' ' + field)
      let names = searchField.ids
      if (searchField.objects) {
        names = searchField.objects.map(object => object?.name)
      }
      if (searchField.excluded) {
        texts.push(capitalizeFirstLetter(field) + ': all except ' + names.join(', '))
      } else {
        texts.push(capitalizeFirstLetter(field) + ': only ' + names.join(', '))
      }
    }
  })
  return texts.join('; ')
})
</script>

<template>
  <button v-if="activeSearch && showButton" @click="router.push(Crumbs.activeSearch.href)">
    {{ text }}
  </button>
</template>