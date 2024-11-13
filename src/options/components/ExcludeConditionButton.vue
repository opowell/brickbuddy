<script setup lang="ts">
import { PropType } from 'vue'
import { excludeCondition } from '../idb/condition';
const { condition } = defineProps({
  condition: String as PropType<string>
})
const emits = defineEmits(['exclude'])
function exclude() {
  if (!condition) {
    return
  }
  excludeCondition(condition)
  emits('exclude')
}
</script>

<template>
  <button v-if="condition" @click="exclude">
    Exclude
  </button>
</template>