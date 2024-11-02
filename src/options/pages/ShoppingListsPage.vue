<script setup lang="ts">
import type { UiShopList } from '../constants'
defineProps({
  lists: Array<UiShopList>
})
defineEmits(['goHome', 'open'])
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
            {{ list.items }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>