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
          <th>Name</th>
          <th>Color</th>
          <th>New Thumb1 Img</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(variant, index) in item.variants" :key="index">
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
          <td><img :src="variant.image"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>