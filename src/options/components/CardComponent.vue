<script setup lang="ts">
import { useRouter } from "vue-router";
import { formatInteger } from "../utils";

const router = useRouter();
defineProps({
  name: String,
  count: Number,
  href: String,
  total: Number,
});
</script>

<template>
  <button @click="router.push(href)" class="main">
    <div>{{ name }}:</div>
    <div v-if="count !== undefined" class="count">{{ formatInteger(count) }}</div>
    <div>/ {{ formatInteger(total) }}</div>
  </button>
</template>

<style lang="css" scoped>
button {
  width: 140px;
  padding: 0.3rem;
}
.count {
  font-size: 3rem;
}
</style>
