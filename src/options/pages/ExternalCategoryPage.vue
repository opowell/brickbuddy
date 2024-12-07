<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import CategoriesButton from '../components/CategoriesButton.vue';
import CategoryButton from '../components/CategoryButton.vue';
import HomeButton from '../components/HomeButton.vue';

import { useRoute } from 'vue-router'
import { CachedExternalCategory, ExternalCategory, ExternalItem, Item } from '../types';
import IncludeCategoryButton from '../components/IncludeCategoryButton.vue';
import ExcludeCategoryButton from '../components/ExcludeCategoryButton.vue';
const route = useRoute()
import { useRouter } from 'vue-router'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ExternalPartButton from '../components/ExternalPartButton.vue';
import { externalCategoriesMap } from '../idb/idb';
const router = useRouter()
import { countFromIndex, getAllFromIndex } from '../idb/db';
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
const category = computed<CachedExternalCategory | undefined>(() => {
  return externalCategoriesMap.value.get(route.params.type + route.params.id)
})
</script>

<template>
  <div v-if="category">
    <HomeButton />
    <CategoriesButton />
    <ActiveSearchButton />
    <h4>External category: {{ category.type }} {{ category.name }} ({{ category.id }})</h4>
    <IncludeCategoryButton :category="category" @include="router.push(Crumbs.categories.href)"/>
    <ExcludeCategoryButton :category="category" @exclude="router.push(Crumbs.categories.href)"/>
    <div>Category: <CategoryButton :category="category.category" /></div>
    <h4>Parts ({{ category.externalParts.length }})</h4>
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
        <tr v-for="part in category.externalParts" :key="part.itemId">
          <td><img v-if="part.image" :src="part.image"></td>
          <td>
            <ExternalPartButton :part="part" />
          </td>
          <td>{{ part.variants?.length }}</td>
          <td>{{ part.invItems?.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>