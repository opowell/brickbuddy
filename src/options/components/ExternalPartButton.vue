<script setup lang="ts">
import { ExternalItem, Item } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
import NameIdLabel from './NameIdLabel.vue';
const { part } = defineProps({
  part: Object as PropType<ExternalItem>
})
const router = useRouter()
const href = computed(() => {
  if (!part) {
    return
  }
  return Crumbs.externalPart(part.name || '', part.externalItemId, part.type).href
})
const name = computed(() => {
  if (!part) {
    return
  }
  return part.type + ' ' + part.name
})
</script>


<template>
  <button v-if="part" @click="router.push(href)">
    <NameIdLabel :name="name" :id="part.externalItemId" />
  </button>
</template>