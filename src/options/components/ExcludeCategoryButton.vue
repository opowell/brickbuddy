<script setup lang="ts">
import { Category } from "../types";
import { PropType } from "vue";
const { category } = defineProps({
  category: Object as PropType<Category>,
});
const emits = defineEmits(["exclude"]);
function exclude() {
  if (!category) {
    return;
  }
  // excludeCategory(category)
  emits("exclude");
}
</script>

<template>
  <button v-if="category" @click="exclude">Exclude</button>
</template>
