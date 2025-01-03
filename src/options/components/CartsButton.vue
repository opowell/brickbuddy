<script setup lang="ts">
import { Crumbs } from "../idb/constants";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <button @click="router.push(Crumbs.carts.href)">Carts</button>
</template>
