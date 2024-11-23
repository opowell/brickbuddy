<script setup lang="ts">
import { CategoriesPageCategory } from '../types';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';

const newId = ref('')
const newName = ref('')

const categories = ref<CategoriesPageCategory[] | undefined>(undefined)
onMounted(async () => {
  categories.value = await getCategoriesPageCategories()
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
import { getCategoriesPageCategories } from '../idb/idb';
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import NameIdLabel from '../components/NameIdLabel.vue';
</script>

<template>
  <div v-if="!categories">
    Loading...
  </div>
  <div v-else>
    <HomeButton />
    <ActiveSearchButton />
    <h4>Categories {{ categories ? '(' + categories.length + ')' : '' }}</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Id</th>
          <th>Name</th>
          <th>BrickLink</th>
          <th>Lego</th>
          <th>Parts</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(category, index) in categories" :key="category.id">
          <td><img v-if="category.image" :src="category.image"></td>
          <td>
            {{ category.id }}
          </td>
          <td>
            <CategoryButton :category="category" />
          </td>
          <td>
            <NameIdLabel :name="category.brickLinkName" :id="category.brickLinkId" />
          </td>
          <td>
            <NameIdLabel :name="category.legoName" :id="category.legoId" />
          </td>
          <td>
            {{ category.numParts }}
          </td>
          <td>
            <ExcludeCategoryButton :category="category" @exclude="excludeCategory(index)"/>
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