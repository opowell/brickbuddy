<script setup lang="ts">
defineProps({
  item: Object
})
defineEmits(['goHome', 'goItems', 'goVariant', 'goColor'])
</script>

<template>
  <div v-if="item">
    <button @click="$emit('goHome')">
      Home
    </button>
    <button @click="$emit('goItems')">
      Items
    </button>
    <h4>{{ item.itemName }}</h4>
    <div>Category: {{ item.categoryString }}</div>
    <h4>Variants</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Color</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(variant, index) in item.variants" :key="index">
          <td><img :src="variant.image"></td>
          <td>
            <button @click="$emit('goVariant', variant)">
              {{ item.itemName + ', ' + variant.color.name }}
            </button>
          </td>
          <td>
            <button @click="$emit('goColor', variant.color)">
              {{ variant.color.name }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>