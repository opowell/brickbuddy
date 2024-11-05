<script setup lang="ts">
import type { UiShopList } from '../types'
defineProps({
  lists: Array<UiShopList>
})
defineEmits(['goHome', 'open', 'add'])
const newListName = ref('')
</script>

<template>
  <div>
    <button @click="$emit('goHome')">
      Home
    </button>
    <h4>Shopping Lists</h4>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Items</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="list in lists" :key="list.id">
          <td>
            <button @click="$emit('open', list)">
              {{ list.name }}
            </button>
          </td>
          <td>
            {{ list.items.length }}
          </td>
        </tr>
      </tbody>
    </table>
    <h4>Add</h4>
    <div>Name:<input v-model="newListName" type="text"></div>
    <button @click="$emit('add', newListName)">
      Add
    </button>
  </div>
</template>