<script setup lang="ts">
import { StoreCountry } from "../types";
import { Crumbs } from "../idb/constants";
import { useRouter } from "vue-router";
import { PropType } from "vue";
import NameIdLabel from "./NameIdLabel.vue";
const { country } = defineProps({
  country: Object as PropType<StoreCountry>,
});
const router = useRouter();
const href = computed(() => {
  if (!country) {
    return;
  }
  return Crumbs.country(country.id).href;
});
const name = computed(() => {
  if (!country) {
    return;
  }
  return country.name;
});
</script>

<template>
  <button v-if="country" @click="router.push(href)">
    <NameIdLabel :name="name" :id="country.id" />
  </button>
</template>
