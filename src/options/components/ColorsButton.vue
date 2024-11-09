<script setup lang="ts">
import { Crumbs } from '../constants';
import { useRouter } from 'vue-router'

const router = useRouter()
</script>


<template>
  <button @click="router.push(Crumbs.colors.href)">
    Colors
  </button>
</template>