<script setup lang="ts">
import type { UiShopList } from '../types'
import HomeButton from '../components/HomeButton.vue';
const newListName = ref('')
const lists = ref([])
function open(list: UiShopList) {

}
function add(name: string) {

}
</script>

<template>
  <div>
    <HomeButton />
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
            <button @click="open(list)">
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
    <button @click="add(newListName)">
      Add
    </button>
  </div>
</template>