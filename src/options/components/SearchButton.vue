<script setup lang="ts">
import { Search } from "../types";
import { Crumbs } from "../idb/constants";
import { useRouter } from "vue-router";
import { PropType } from "vue";
import NameIdLabel from "./NameIdLabel.vue";
const { search } = defineProps({
  label: String,
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
    <template v-if="label === undefined">
      <NameIdLabel :name="search.name" :id="search.id" />
    </template>
    <template v-else>
      {{ label }}
    </template>
  </button>
</template>
