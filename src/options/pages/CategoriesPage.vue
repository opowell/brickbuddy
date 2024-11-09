<script setup lang="ts">
import { CategoriesPageCategory } from '../types';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';

const newId = ref('')
const newName = ref('')

const categories = ref<CategoriesPageCategory[] | undefined>(undefined)
onMounted(async () => {
  categories.value = await getCategoriesPageCategories()
})
function add() {
  emits('add', {
    id: newId.value,
    name: newName.value
  })
}
import CategoryButton from '../components/CategoryButton.vue';
import HomeButton from '../components/HomeButton.vue';
import FiltersBar from '../components/FiltersBar.vue';
import { getCategoriesPageCategories } from '../idb';
</script>

<template>
  <div>
    <HomeButton />
    <FiltersBar />
    <h4>Categories {{ categories ? '(' + categories.length + ')' : '' }}</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Id</th>
          <th>Name</th>
          <th>Parts</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in categories" :key="category.id">
          <td><img v-if="category.image" :src="category.image"></td>
          <td>
            {{ category.id }}
          </td>
          <td>
            <CategoryButton :category="category" />
          </td>
          <td>
            {{ category.numParts }}
          </td>
          <td>
            <ExcludeCategoryButton :category="category" />
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