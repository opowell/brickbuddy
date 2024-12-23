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
  if (newQ.value === undefined || max === undefined) {
    return true;
  }
  return (
    newQ.value === current || newQ.value > max || newQ.value === "" || newQ.value < 0
  );
});
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

<style lang="css" scoped>
input {
  width: 5rem;
}
</style>
