<script setup lang="ts">
import CategoryPage from './pages/CategoryPage.vue'
import ColorPage from './pages/ColorPage.vue'
import ItemPage from './pages/ItemPage.vue'
import ItemVariantPage from './pages/ItemVariantPage.vue'
import StorePage from './pages/StorePage.vue'
import ShoppingListPage from './pages/ShoppingListPage.vue'
import SearchPage from './pages/SearchPage.vue'
import type { Color, UiCategory, UiItem, UiItemVariant, UiSearch, UiShopList } from './types'
import { fetchingStoreInventory, searchRemoveStore, searches, categories, setSearchShopList, addNewSearch, stopFetching, addSearchStore, startFetching, addNewShopListItem, colors, items, shopLists, itemVariantPageAddToList, loadModels, openCategory, openSearch, openStore, stores } from './idb';
import { PAGES } from './constants'

onMounted(() => {
  loadModels()
  startFetching()
})

const openItemVariant = ref<UiItemVariant | null>(null)
const openShopList = ref<UiShopList | null>(null)

const page = ref(PAGES.HOME)

watch(page, () => {
  if (page.value !== PAGES.STORE) {
    openStore.value = null
  }
  window.scrollTo(0, 0)
})
function goShopList(shopList: UiShopList) {
  openShopList.value = shopList
  page.value = PAGES.SHOP_LIST
}
const openItem = ref<UiItem | null>(null)
function goItem(item: UiItem) {
  openItem.value = item
  page.value = PAGES.PART
}
function goColor(color: Color) {
  openColor.value = color
  page.value = PAGES.COLOR
}
function goSearch(search: UiSearch) {
  openSearch.value = search
  page.value = PAGES.SEARCH
}
function goVariant(variant: UiItemVariant) {
  openItemVariant.value = variant
  page.value = PAGES.PART_VARIANT
}
function goCategory(category: UiCategory) {
  openCategory.value = category
  page.value = PAGES.CATEGORY
}
const openColor = ref<Color | null>(null)
</script>
<template>
  <router-view />
  <CategoryPage
    v-if="page === PAGES.CATEGORY && openCategory"
    :category="openCategory"
    @go-home="page = PAGES.HOME"
    @go-categories="page = PAGES.CATEGORIES"
  />
  <ColorPage
    v-else-if="page === PAGES.COLOR && openColor"
    :color="openColor"
    @go-home="page = PAGES.HOME"
    @go-colors="page = PAGES.COLORS"
  />
  <ItemVariantPage
    v-else-if="page === PAGES.PART_VARIANT && openItemVariant"
    :lists="shopLists"
    :variant="openItemVariant"
    @go-home="page = PAGES.HOME"
    @go-items="page = PAGES.PARTS"
    @go-item="page = PAGES.PART"
    @go-store="goStore"
    @add-to-list="itemVariantPageAddToList"
  />
  <StorePage
    v-else-if="page === PAGES.STORE && openStore"
    :fetching="fetchingStoreInventory"
    :store="openStore"
    @go-home="page = PAGES.HOME"
    @go-stores="page = PAGES.STORES"
    @go-item="goItem"
    @go-variant="goVariant"
    @start-fetching="startFetching"
    @stop-fetching="stopFetching"
    @go-color="goColor"
  />
  <ShoppingListPage
    v-else-if="page === PAGES.SHOP_LIST && openShopList"
    :list="openShopList"
    :parts="items"
    @go-home="page = PAGES.HOME"
    @add-item="addNewShopListItem"
    @go-shop-lists="page = PAGES.SHOP_LISTS"
    @go-item="goItem"
  />
  <SearchPage
    v-else-if="page === PAGES.SEARCH && openSearch"
    :search="openSearch"
    :shop-lists="shopLists"
    :stores="stores"
    @go-home="page = PAGES.HOME"
    @go-store="goStore"
    @set-list="setSearchShopList"
    @add-store="addSearchStore"
    @remove-store="searchRemoveStore"
  />
</template>
