<script setup lang="ts">
import HomePage from './pages/HomePage.vue'
import StoresPage from './pages/StoresPage.vue'
import ColorsPage from './pages/ColorsPage.vue'
import ColorPage from './pages/ColorPage.vue'
import ItemsPage from './pages/ItemsPage.vue'
import ItemPage from './pages/ItemPage.vue'
import ItemVariantPage from './pages/ItemVariantPage.vue'
import StorePage from './pages/StorePage.vue'
import ShoppingListsPage from './pages/ShoppingListsPage.vue'
import ShoppingListPage from './pages/ShoppingListPage.vue'
import SearchesPage from './pages/SearchesPage.vue'
import SearchPage from './pages/SearchPage.vue'
import type { Color, UiItem, UiItemVariant, UiSearch, UiShopList, UiStore } from './types'
import { fetchingStoreInventory, searchRemoveStore, searches, setSearchShopList, addNewSearch, stopFetching, addShopList, addSearchStore, startFetching, addNewShopListItem, addNewStore, colors, items, shopLists, itemVariantPageAddToList, loadModels, openSearch, openStore, stores } from './idb';
import { PAGES } from './constants'

onMounted(() => {
  loadModels()
  setScraping(true)
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
function goStore(store: UiStore) {
  openStore.value = store
  page.value = PAGES.STORE
}
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
const openColor = ref<Color | null>(null)
const scrapingOn = ref(true)
function setScraping(value: boolean) {
  if (value) {
    startFetching()
  } else {
    stopFetching()
  }
  scrapingOn.value = value
}
</script>
<template>
  <HomePage
    v-if="page === PAGES.HOME"
    v-model="page"
  />
  <StoresPage
    v-else-if="page === PAGES.STORES"
    :scraping-on="scrapingOn"
    :stores="stores"
    @go-home="page = PAGES.HOME"
    @set-scraping="setScraping"
    @go-store="goStore"
    @add="addNewStore"
  />
  <ColorsPage
    v-else-if="page === PAGES.COLORS"
    :colors="colors"
    @go-home="page = PAGES.HOME"
    @go-color="goColor"
  />
  <ColorPage
    v-else-if="page === PAGES.COLOR && openColor"
    :color="openColor"
    @go-home="page = PAGES.HOME"
    @go-colors="page = PAGES.COLORS"
  />
  <ItemsPage
    v-else-if="page === PAGES.PARTS"
    :items="items"
    @go-home="page = PAGES.HOME"
    @go-item="goItem"
  />
  <ItemPage
    v-else-if="page === PAGES.PART && openItem"
    :item="openItem"
    @go-home="page = PAGES.HOME"
    @go-items="page = PAGES.PARTS"
    @go-variant="goVariant"
    @go-color="goColor"
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
  <ShoppingListsPage
    v-else-if="page === PAGES.SHOP_LISTS"
    :lists="shopLists"
    @go-home="page = PAGES.HOME"
    @open="goShopList"
    @add="addShopList"
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
  <SearchesPage
    v-else-if="page === PAGES.SEARCHES"
    :searches="searches"
    @add="addNewSearch"
    @go-home="page = PAGES.HOME"
    @go-search="goSearch"
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
