<script setup lang="ts">
const { current, max } = defineProps({
  current: Number,
  max: Number,
});
const newQ = ref<undefined | number>(current);
const emits = defineEmits(["updateQuantity"]);
watch(
  () => current,
  () => {
    newQ.value = current;
  }
);
const setButtonDisabled: ComputedRef<boolean> = computed(() => {
  if (newQ.value === undefined) {
    return true;
  }
  if (newQ.value === current) {
    return true;
  }
  if (max === undefined) {
    return false;
  }
  return newQ.value > max || newQ.value === "" || newQ.value < 0;
});
function setNewQ(x: number) {
  newQ.value = x;
}
defineExpose({ newQ, setNewQ });
</script>

<template>
  {{ current }}
  <button :disabled="newQ === 0" @click="newQ = 0">&Lt;</button>
  <input v-model="newQ" type="number" min="0" :max="max" />
  <button :disabled="newQ === max" @click="newQ = max">&Gt;</button>
  <button :disabled="setButtonDisabled" @click="emits('updateQuantity', newQ)">
    Set
  </button>
</template>
