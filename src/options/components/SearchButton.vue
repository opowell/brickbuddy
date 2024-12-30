<script setup lang="ts">
import { Search } from "../types";
import { Crumbs } from "../idb/constants";
import { useRouter } from "vue-router";
import { PropType } from "vue";
import NameIdLabel from "./NameIdLabel.vue";
const { search } = defineProps({
  search: Object as PropType<Search>,
});
const router = useRouter();
const href = computed(() => {
  if (!search) {
    return;
  }
  return Crumbs.search(search.id).href;
});
</script>

<template>
  <button v-if="search" @click="router.push(href)">
    <NameIdLabel :name="search.name" :id="search.id" />
  </button>
</template>
