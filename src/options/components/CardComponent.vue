<script setup lang="ts">
import { useRouter } from "vue-router";
import { formatInteger } from "../utils";

const router = useRouter();
defineProps({
  name: String,
  count: Number,
  href: String,
});
</script>

<template>
  <button @click="router.push(href)">
    <div v-if="count !== undefined" class="count">{{ formatInteger(count) }}</div>
    <div class="name">{{ name }}</div>
  </button>
</template>

<style lang="css" scoped>
button {
  width: 140px;
  height: 100px;
}
.name {
}
.count {
  font-size: 3rem;
}
</style>
