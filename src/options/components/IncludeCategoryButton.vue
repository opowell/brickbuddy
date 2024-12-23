<script setup lang="ts">
import { Category } from "../types";
import { PropType } from "vue";
const { category } = defineProps({
  category: Object as PropType<Category>,
});
const emits = defineEmits(["include"]);
function include() {
  if (!category) {
    return;
  }
  // includeCategory(category)
  emits("include");
}
</script>

<template>
  <button v-if="category" @click="include">Include</button>
</template>
