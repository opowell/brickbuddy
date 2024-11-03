<script setup lang="ts">
defineProps({
  item: Object
})
defineEmits(['goHome', 'goItems', 'goVariant'])
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
    <div>Variants</div>
    <table>
      <thead>
        <tr>
          <th>Color</th>
          <th>New Thumb1 Img</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(variant, index) in item.variants" :key="index">
          <td>
            <button @click="$emit('goVariant', variant)">
              {{ variant.color.name }}
            </button>
          </td>
          <td><img :src="`https:${variant.newThumb1Img}`"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>