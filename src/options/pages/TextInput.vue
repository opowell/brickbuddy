<script setup lang="ts">
const { value } = defineProps({
  value: String,
});
const valueDirty = ref(value);
function reset() {
  valueDirty.value = value;
}
</script>

<template>
  <span>
    <input v-model="valueDirty" />
    <button @click="$emit('set', valueDirty)">Set</button>
    <button @click="reset" :disabled="value === valueDirty">Reset</button>
  </span>
</template>
