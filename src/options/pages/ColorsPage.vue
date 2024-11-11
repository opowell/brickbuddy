<script setup lang="ts">
const colors = ref<UiColor[] | undefined>(undefined)
onMounted(async () => {
  colors.value = await getUiColors()
})
const newId = ref('')
const newName = ref('')

function add() {
  // emits('add', {
  //   id: newId.value,
  //   name: newName.value
  // })
}

import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ColorButton from '../components/ColorButton.vue';
import HomeButton from '../components/HomeButton.vue';
import { getUiColors } from '../idb';
import { UiColor } from '../types';
</script>

<template>
  <div>
    <HomeButton />
    <ActiveSearchButton />
    <h4>Colors</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Id</th>
          <th>Name</th>
          <th>Inventory Items</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="color in colors" :key="color.id">
          <td><img v-if="color.image" :src="color.image"></td>
          <td>
            {{ color.id }}
          </td>
          <td>
            <ColorButton :color="color" />
          </td>
          <td>
            <button @click="$emit('goColor', color)">
              {{ color.numInvItems }}
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