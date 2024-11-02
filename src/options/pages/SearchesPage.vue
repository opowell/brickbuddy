<script setup lang="ts">
import type { UiShopList } from '../constants'
defineProps({
  lists: Array<UiShopList>
})
defineEmits(['goHome'])
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
          <th>Items</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="list in lists" :key="list.id">
          <td>
            {{ list.name }}
          </td>
          <td>
            {{ list.items }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>