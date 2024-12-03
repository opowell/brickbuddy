<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import CategoriesButton from '../components/CategoriesButton.vue';
import HomeButton from '../components/HomeButton.vue';

import { useRoute } from 'vue-router'
import { getCategoryPageCategory, getExternalCategories, getExternalCategory } from '../idb/categories';
import { Category, CategoryPageCategory, ExternalCategory, ExternalItem, Item, ItemVariant } from '../types';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';
const route = useRoute()
import { useRouter } from 'vue-router'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ExternalPartButton from '../components/ExternalPartButton.vue';
import NameIdLabel from '../components/NameIdLabel.vue';
import { getDbConnection } from '../idb/idb';
const router = useRouter()
import STORES from '../idb/stores'
import { countFromIndex, get, getAllFromIndex } from '../idb/db';
import { IDBPDatabase } from 'idb';
import indices from '../idb/indices';
interface Item extends ExternalItem {
  numVariants: number
  numInvItems: number
}
interface Category extends ExternalCategory {
  parts: Item[]
}
async function getNumVariantsByTypeAndPart(db: IDBPDatabase, type: string, itemId: string): Promise<number> {
  return await countFromIndex(db, indices.PART_VARIANTS_BY_TYPE_AND_PART, [type, itemId])
}
async function getNumInvItems(db: IDBPDatabase, type: string, itemId: string): Promise<number> {
  return await countFromIndex(db, indices.INV_ITEMS_BY_TYPE_AND_ITEM, [type, itemId])
}
async function getParts(db: IDBPDatabase, id: string, type: string): Promise<Item[]> {
  const externalParts: ExternalItem[] = await getAllFromIndex(db, indices.EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY, [type, id])
  const parts: Item[] = []
  for (let i = 0; i < externalParts.length; i++) {
    const externalPart = externalParts[i]
    const numVariants = await getNumVariantsByTypeAndPart(db, externalPart.type, externalPart.externalItemId)
    const numInvItems = await getNumInvItems(db, externalPart.type, externalPart.externalItemId)
    parts.push({
      ...externalPart,
      numVariants,
      numInvItems
    })
  }
  return parts
}
const category = ref<Category | undefined>(undefined)
async function getExternalCategoryPageExternalCategory(id: string, type: "BrickLink" | "Lego" | "Rebrickable"): Promise<ExternalCategoryPageExternalCategory | undefined> {
  const db = await getDbConnection()
  const category: ExternalCategory = await getExternalCategory(db, id, type)
  if (!category) {
    return
  }
  const parts: ExternalItem[] = await getParts(db, id, type)
  return {
    ...category,
    parts,
  }
}
onMounted(async () => {
  category.value = await getExternalCategoryPageExternalCategory(route.params.id, route.params.type)
})
</script>

<template>
  <div v-if="category">
    <HomeButton />
    <CategoriesButton />
    <ActiveSearchButton />
    <h4>{{ category.type }} {{ category.name }} ({{ category.id }})</h4>
    <IncludeCategoryButton :category="category" @include="router.push(Crumbs.categories.href)"/>
    <ExcludeCategoryButton :category="category" @exclude="router.push(Crumbs.categories.href)"/>
    <div>Category: {{ category.categoryId }}</div>
    <h4>Parts ({{ category.parts.length }})</h4>
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
        <tr v-for="part in category.parts" :key="part.itemId">
          <td><img v-if="part.image" :src="part.image"></td>
          <td>
            <ExternalPartButton :part="part" />
          </td>
          <td>{{ part.numVariants }}</td>
          <td>{{ part.numInvItems }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>