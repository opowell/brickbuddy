<script setup lang="ts">
import PartsButton from '../components/PartsButton.vue';
import StoresButton from '../components/StoresButton.vue';
import { PAGES } from '../constants'
defineProps({
  modelValue: String
})
defineEmits([
  'update:modelValue'
])
import { Crumbs } from '../constants';
import { useRouter } from 'vue-router'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
const router = useRouter()
</script>

<template>
  <div>
    <h4>Brick Buddy</h4>
    <p>
      <ActiveSearchButton />
    </p>
    <StoresButton />
    <button @click="router.push(Crumbs.shoppingLists.href)">
      Shopping Lists
    </button>
    <button @click="router.push(Crumbs.colors.href)">
      Colors
    </button>
    <button @click="router.push(Crumbs.searches.href)">
      Searches
    </button>
    <PartsButton />
    <button @click="router.push(Crumbs.categories.href)">
      Categories
    </button>
  </div>
</template>