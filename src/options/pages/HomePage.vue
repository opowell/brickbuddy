<script setup lang="ts">
import PartsButton from '../components/PartsButton.vue';
import StoresButton from '../components/StoresButton.vue';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ColorsButton from '../components/ColorsButton.vue';
import SearchesButton from '../components/SearchesButton.vue';
import CategoriesButton from '../components/CategoriesButton.vue';
import ConditionsButton from '../components/ConditionsButton.vue';
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
    <ColorsButton />
    <ConditionsButton />
    <SearchesButton />
    <PartsButton />
    <CategoriesButton />
  </div>
</template>