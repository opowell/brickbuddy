<script setup lang="ts">
import { ShopList, Store } from "../types";
import { Crumbs } from "../idb/constants";
import { useRouter } from "vue-router";
import { PropType } from "vue";
const { list } = defineProps({
  list: Object as PropType<ShopList>,
});

const router = useRouter();
const href = computed(() => {
  if (!list) {
    return;
  }
  return Crumbs.shopList(list.id).href;
});
</script>

<template>
  <button v-if="list" @click="router.push(href)">Shop</button>
</template>
