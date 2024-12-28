<script setup lang="ts">
defineProps({
  included: Boolean,
  excluded: Boolean,
  allowClear: Boolean,
});
</script>

<template>
  <div>
    <button :disabled="included" @click="$emit('include')">Include</button>
    <button :disabled="excluded" @click="$emit('exclude')">Exclude</button>
    <button :disabled="!excluded && !included && !allowClear" @click="$emit('clear')">
      Clear
    </button>
  </div>
</template>
