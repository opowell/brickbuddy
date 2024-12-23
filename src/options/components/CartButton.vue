<script setup lang="ts">
import { Cart } from "../types";
import { Crumbs } from "../idb/constants";
import { useRouter } from "vue-router";
import { PropType } from "vue";
import NameIdLabel from "./NameIdLabel.vue";
const { cart } = defineProps({
  cart: Object as PropType<Cart>,
});
const router = useRouter();
const href = computed(() => {
  if (!cart) {
    return;
  }
  return Crumbs.cart(cart.id).href;
});
</script>

<template>
  <button v-if="cart" @click="router.push(href)">
    <NameIdLabel :name="cart.name" :id="cart.id" />
  </button>
</template>
