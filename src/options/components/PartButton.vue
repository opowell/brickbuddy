<script setup lang="ts">
import { PartButtonPart } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
import NameIdLabel from './NameIdLabel.vue';
const { part } = defineProps({
  part: Object as PropType<PartButtonPart>
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
    const partWithName = part.externalParts.find(e => e.name)
    if (!partWithName) {
      return
    }
    return partWithName.name
  }
  return ''
})
</script>


<template>
  <button v-if="part" @click="router.push(href)">
    <NameIdLabel :name="name" :id="part.itemId" />
  </button>
</template>