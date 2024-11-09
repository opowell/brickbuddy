<script setup lang="ts">
const { colors } = defineProps({
  colors: Object
})
const emits = defineEmits(['goHome', 'add', 'goColor'])
const newId = ref('')
const newName = ref('')

function add() {
  emits('add', {
    id: newId.value,
    name: newName.value
  })
}

const colorsArray = computed(() => {
  if (!colors) {
    return []
  }
  return Object.keys(colors).map(key => colors[key])
})
import HomeButton from '../components/HomeButton.vue';
</script>

<template>
  <div>
    <HomeButton />
    <h4>Colors</h4>
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="color in colorsArray" :key="color.id">
          <td>
            {{ color.id }}
          </td>
          <td>
            <button @click="$emit('goColor', color)">
              {{ color.name }}
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