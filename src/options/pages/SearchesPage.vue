<script setup lang="ts">
import type { UiSearch } from '../constants'
defineProps({
  searches: Array<UiSearch>
})
defineEmits(['goHome', 'add', 'goSearch'])
const newName = ref<string>('')
</script>

<template>
  <div>
    <button @click="$emit('goHome')">
      Home
    </button>
    <h4>Searches</h4>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Shop List</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="search in searches" :key="search.id">
          <td>
            <button @click="$emit('goSearch', search)">
              {{ search.name }}
            </button>
          </td>
          <td>
            {{ search.shoppingList?.name }}
          </td>
        </tr>
      </tbody>
    </table>
    <h4>Add</h4>
    <div>Name:<input v-model="newName" type="text"></div>
    <button @click="$emit('add', newName)">
      Add
    </button>
  </div>
</template>