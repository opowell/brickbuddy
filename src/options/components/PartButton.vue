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
  if (!part || !name.value) {
    return
  }
  return Crumbs.part(name.value, part.itemId).href
})
const name = computed(() => {
  if (!part) {
    return
  }
  if (part.externalParts) {
    return part.externalParts.find(e => e.name).name
  }
  return ''
})
</script>


<template>
  <button v-if="part" @click="router.push(href)">
    <NameIdLabel :name="name" :id="part.itemId" />
  </button>
</template>