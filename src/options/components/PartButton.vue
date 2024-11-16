<script setup lang="ts">
import { Item } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
import NameIdLabel from './NameIdLabel.vue';
const { part } = defineProps({
  part: Object as PropType<Item>
})
const router = useRouter()
const href = computed(() => {
  if (!part) {
    return
  }
  return Crumbs.part(part.itemName, part.itemId).href
})
</script>


<template>
  <button v-if="part" @click="router.push(href)">
    <NameIdLabel :name="part.itemName" :id="part.itemId" />
  </button>
</template>