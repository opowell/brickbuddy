<script setup lang="ts">
import { UiItem, UiItemVariant } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
const { part, variant } = defineProps({
  part: Object as PropType<UiItem>,
  variant: Object as PropType<UiItemVariant>
})
const router = useRouter()
const href = computed(() => {
  if (!part || !variant) {
    return
  }
  return Crumbs.partVariant(part.itemName, part.itemId, variant.colorId).href
})
</script>


<template>
  <button @click="router.push(href)">
    <slot>
      {{ part?.itemName + ', ' + variant?.color.name }}
    </slot>
  </button>
</template>