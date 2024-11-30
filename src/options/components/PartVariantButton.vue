<script setup lang="ts">
import { PartVariantButtonVariant, Item, ExternalItem } from '../types';
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import {PropType} from 'vue'
const { part, variant } = defineProps({
  part: Object as PropType<ExternalItem>,
  variant: Object as PropType<PartVariantButtonVariant>
})
const router = useRouter()
const href = computed(() => {
  if (!part || !variant) {
    return
  }
  return Crumbs.partVariant(part.name, part.itemId + '', variant.colorId).href
})
</script>


<template>
  <button @click="router.push(href)">
    <slot>
      {{ part?.name + ', ' + variant?.color.name }}
    </slot>
  </button>
</template>