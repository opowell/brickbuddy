<script setup lang="ts">
import { BrickLinkCategoriesPageCategory } from '../types';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';
import ExcludeBrickLinkCategoryButton from '../components/ExcludeBrickLinkCategoryButton.vue';

const newId = ref('')
const newName = ref('')

const categories = ref<BrickLinkCategoriesPageCategory[] | undefined>(undefined)
onMounted(async () => {
  categories.value = await getBrickLinkCategoriesPageCategories()
})
function add() {
}
function excludeCategory(index: number) {
  categories.value?.splice(index, 1)
}
function includeCategory(index: number) {
  categories.value = categories.value?.splice(index, 1)
}
import CategoryButton from '../components/CategoryButton.vue';
import HomeButton from '../components/HomeButton.vue';
import { getBrickLinkCategoriesPageCategories } from '../idb/idb';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
</script>

<template>
  <div v-if="!categories">
    Loading...
  </div>
  <div v-else>
    <HomeButton />
    <ActiveSearchButton />
    <h4>BrickLink Categories {{ categories ? '(' + categories.length + ')' : '' }}</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Categories</th>
          <th>Parts</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(category, index) in categories" :key="category.id">
          <td><img v-if="category.image" :src="category.image"></td>
          <td>
            <CategoryButton :category="category" />
          </td>
          <td>
            {{ category.categoryIds.join(', ') }}
          </td>
          <td>
            {{ category.numParts }}
          </td>
          <td>
            <ExcludeBrickLinkCategoryButton :category="category" @exclude="excludeCategory(index)"/>
            <IncludeCategoryButton :category="category" @include="includeCategory(index)"/>
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