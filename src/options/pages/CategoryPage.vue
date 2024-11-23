<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import CategoriesButton from '../components/CategoriesButton.vue';
import HomeButton from '../components/HomeButton.vue';

import { useRoute } from 'vue-router'
import { getCategoryPageCategory } from '../idb/idb';
import { CategoryPageCategory } from '../types';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';
const route = useRoute()
import { useRouter } from 'vue-router'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import PartButton from '../components/PartButton.vue';
import NameIdLabel from '../components/NameIdLabel.vue';
const router = useRouter()
const category = ref<CategoryPageCategory | undefined>(undefined)
onMounted(async () => {
  category.value = await getCategoryPageCategory(route.params.id)
})
</script>

<template>
  <div v-if="category">
    <HomeButton />
    <CategoriesButton />
    <ActiveSearchButton />
    <h4>{{ category.name }}</h4>
    <IncludeCategoryButton :category="category" @include="router.push(Crumbs.categories.href)"/>
    <ExcludeCategoryButton :category="category" @exclude="router.push(Crumbs.categories.href)"/>
    <div>Id: {{ category.id }}</div>
    <div>Bricklink: <NameIdLabel is-span :id="category.brickLinkId" :name="category.brickLinkName" /></div>
    <div>Lego: <NameIdLabel is-span :id="category.legoId" :name="category.legoName" /></div>
    <h4>Parts</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Colors</th>
          <th>Inv. items</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in category.parts" :key="item.itemId">
          <td><img v-if="item.variants?.length" :src="item.variants[0].image"></td>
          <td>
            <PartButton :part="item" />
          </td>
          <td>{{ item.variants?.length }}</td>
          <td>{{ item.numInvItems }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>