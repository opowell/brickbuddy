<script setup lang="ts">
import { Category } from "../types";
interface CategoryTableCategory extends Category {
  image: string;
  numParts: number;
}
defineProps({
  categories: Object as PropType<CategoryTableCategory[]>,
});
defineEmits(["remove"]);
import CategoryButton from "../components/CategoryButton.vue";
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Actions</th>
        <th>Image</th>
        <th>Name</th>
        <th>Parts</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="category in categories" :key="category.id">
        <td>
          <button @click="emits('remove', category)">x</button>
        </td>
        <td><img v-if="category.image" :src="category.image" /></td>
        <td>
          <CategoryButton :category="category" />
        </td>
        <td>
          {{ category.numParts }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
