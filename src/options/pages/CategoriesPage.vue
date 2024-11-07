<script setup lang="ts">
import { UiCategory } from '../types';

const { categories } = defineProps({
  categories: Map<string, UiCategory>
})
const emits = defineEmits(['goHome', 'add', 'goCategory'])
const newId = ref('')
const newName = ref('')

function add() {
  emits('add', {
    id: newId.value,
    name: newName.value
  })
}

const categoriesArray = computed(() => {
  if (!categories) {
    return []
  }
  return Array.from(categories.values())
})
</script>

<template>
  <div>
    <button @click="$emit('goHome')">
      Home
    </button>
    <h4>Categories</h4>
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Parts</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in categoriesArray" :key="category.id">
          <td>
            {{ category.id }}
          </td>
          <td>
            <button @click="$emit('goCategory', category)">
              {{ category.name }}
            </button>
          </td>
          <td>
            <button @click="$emit('goCategory', category)">
              {{ category.numParts }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <h4>Add</h4>
    <div>Id:<input v-model="newId" type="text"></div>
    <div>Name:<input v-model="newName" type="text"></div>
    <button @click="add">
      Add new
    </button>
  </div>
</template>