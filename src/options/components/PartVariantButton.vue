<script setup lang="ts">
import { PartVariantButtonVariant, Item } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
const { part, variant } = defineProps({
  part: Object as PropType<Item>,
  variant: Object as PropType<PartVariantButtonVariant>
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