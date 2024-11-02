<script setup lang="ts">
import type { UiStore } from '../constants';
defineProps({
  stores: Array<UiStore>
})
const emits = defineEmits(['goHome', 'goStore', 'add'])
const newStoreId = ref('')
const newStoreName = ref('')

function add() {
  emits('add', {
    sId: newStoreId.value,
    name: newStoreName.value
  })
}
</script>

<template>
  <div>
    <button @click="$emit('goHome')">
      Home
    </button>
    <h4>Stores</h4>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Inventory</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="store in stores" :key="store.sId">
          <td>
            <button @click="$emit('goStore', store)">
              {{ store.name }}
            </button>
          </td>
          <td>
            {{ store.items.length }}
          </td>
        </tr>
      </tbody>
    </table>
    <h4>Add store</h4>
    <div>Id:<input v-model="newStoreId" type="text"></div>
    <div>Name:<input v-model="newStoreName" type="text"></div>
    <button @click="add">
      Add new
    </button>
  </div>
</template>