<script setup lang="ts">
import { ShopList } from "../types";
import { Crumbs } from "../idb/constants";
import { useRouter } from "vue-router";
import { PropType } from "vue";
import NameIdLabel from "./NameIdLabel.vue";
const { list } = defineProps({
  list: Object as PropType<ShopList>,
});
const router = useRouter();
const href = computed(() => {
  if (!list) {
    return;
  }
  return Crumbs.list(list.id).href;
});
const name = computed(() => {
  if (!list) {
    return;
  }
  return list.name;
});
</script>

<template>
  <button v-if="list" @click="router.push(href)">
    <NameIdLabel :name="name" :id="list.id" />
  </button>
</template>
