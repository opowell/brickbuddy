<script setup lang="ts">
import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';

import * as math from 'mathjs'
import STORES from './stores'
import HomePage from './pages/HomePage.vue'
import StoresPage from './pages/StoresPage.vue'
import ColorsPage from './pages/ColorsPage.vue'
import ItemsPage from './pages/ItemsPage.vue'
import ItemPage from './pages/ItemPage.vue'
import ItemVariantPage from './pages/ItemVariantPage.vue'
import StorePage from './pages/StorePage.vue'
import ShoppingListsPage from './pages/ShoppingListsPage.vue'
import ShoppingListPage from './pages/ShoppingListPage.vue'
import SearchesPage from './pages/SearchesPage.vue'
import type { Color, InvItem, Item, ItemVariant, Search, ShopList, ShopListItem, Store, UiInvItem, UiItem, UiItemVariant, UiShopList, UiStore } from './constants'
import { DB_NAME } from './constants'

const openShopList = ref<UiShopList | null>(null)
const openItemVariant = ref<UiItemVariant | null>(null)
async function getPrices(store: UiStore, i: number) {
  console.log('get prices', store, i)
  const response = await fetch(`https://store.bricklink.com/ajax/clone/store/searchitems.ajax?sort=6&pgSize=100&pg=${i}&showHomeItems=0&sid=${store.sId}`, {
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })
  const json = await response.json()
  const db = await getDbConnection()
  for (let i = 0; i < json.result.groups.length; i++) {
    const group = json.result.groups[i]
    for (let j = 0; j < group.items.length; j++) {
      const invItem = group.items[j]
      try {
        await addColor(db, invItem.colorID, invItem.colorName)
        const item = await addItem(
          invItem.categoryString,
          invItem.colorID,
          invItem.itemID,
          invItem.itemName,
          invItem.itemNo,
          invItem.itemSeq,
          invItem.itemStatus,
          invItem.itemType,
          invItem.largeImg,
          invItem.newItemImg,
          invItem.newThumb1Img,
          invItem.newThumb2Img,
          invItem.smallImg,
          db
        )
        await addInvItem(
          db,
          invItem.invID,
          store,
          invItem.colorID,
          invItem.invNew,
          invItem.invQty,
          math.number(math.multiply(math.bignumber(100), math.bignumber(invItem.rawConvertedPrice))),
          invItem.itemID,
          item
        )
      } catch (e) {
        console.log('error adding item', item, e)
      }
    }
  }
}
let stopFetch: boolean = false
const fetchingStoreInventory = ref(false)
function stopFetching() {
  fetchingStoreInventory.value = false
  stopFetch = true
}
const stores = ref<UiStore[]>([])
let fetchPricesInterval: NodeJS.Timeout
const openStore = ref<UiStore | null>(null)

async function startFetching() {
  if (fetchingStoreInventory.value) {
    return
  }
  stopFetch = false
  let i = 0
  const store = openStore.value
  if (!store) {
    return
  }
  fetchingStoreInventory.value = true
  fetchPricesInterval = setInterval(() => {
    if (stopFetch && fetchPricesInterval) {
      clearInterval(fetchPricesInterval)
      return
    }
    getPrices(store, i)
    i++
  }, 5000)
}
const shopLists = ref<UiShopList[]>([])

async function createInitialData(db: IDBPDatabase) {
  await addStore("Die Steinschleuder", "1832236", db)
  await addStore("Bricks Austria", "3112575", db)
  await addStore("A brick per day...", "709693", db)
  
  await addShopListDb("Board games 2024", db)
  
  await addShopListItem(1, 378, 'New', 10, 100, 20, '3', db)
  stores.value = []
  shopLists.value = []
}

const items = ref<UiItem[]>([])

async function getVariantInvItems(db: IDBPDatabase, variant: ItemVariant, item: Item) {
  const tx = db.transaction(db.objectStoreNames, 'readonly')
  const objStore = tx.objectStore(STORES.INVENTORY_ITEMS.name)
  const index = objStore.index('itemId_color')
  if (!index) {
    return []
  }
  try {
    const storeItems = await index.getAll([item.itemId, variant.colorId])
    for (let i = 0; i < storeItems.length; i++) {
      const storeItem = storeItems[i]
      storeItem.item = item
      storeItem.colorName = colors.value[variant.colorId].name
    }
    return storeItems
  } catch (e) {
    console.log('error getting store items', e, storeId)
  }

  return []
}
async function addItem(
  categoryString: string,
  colorId: number,
  itemId: number,
  itemName: string,
  itemNo: string,
  itemSeq: number,
  itemStatus: string,
  itemType: string,
  largeImg: string,
  newItemImg: string,
  newThumb1Img: string,
  newThumb2Img: string,
  smallImg: string,
  db: IDBPDatabase
) {
  const newItem: Item = {
    categoryString,
    itemId,
    itemName,
    itemNo,
    itemSeq,
    itemStatus,
    itemType,
  }
  db.put(STORES.ITEMS.name, newItem)
  const variant: ItemVariant = {
    itemId,
    colorId,
    largeImg,
    newItemImg,
    newThumb1Img,
    newThumb2Img,
    smallImg,
  }
  db.put(STORES.ITEM_IMAGES.name, variant)
  const uiVariant: UiItemVariant = {
    ...variant,
    color: colors.value[variant.colorId],
    invItems: await getVariantInvItems(db, variant, newItem)
  }
  const uiItem = {
    ...newItem,
    variants: [uiVariant]
  }
  items.value.push(uiItem)
  return uiItem
}

async function getDbConnection() {
  // console.log('getDbConnection')
  let createData = false
  const db = await openDB(DB_NAME, 1, {
    async upgrade(db, oldVersion, newVersion, transaction) {
      Object.keys(STORES).forEach((key) => {
        const store = STORES[key]
        db.createObjectStore(store.name, {
          keyPath: store.keyPath,
          autoIncrement: store.autoIncrement === true
        })
      })
      const invItemsStore = transaction.objectStore(STORES.INVENTORY_ITEMS.name)
      invItemsStore.createIndex('storeId', 'storeId')
      invItemsStore.createIndex('itemId_color', ['itemId', 'color'])
      const itemVariantsStore = transaction.objectStore(STORES.ITEM_IMAGES.name)
      itemVariantsStore.createIndex('itemId', 'itemId')
      const shopListItemsStore = transaction.objectStore(STORES.SHOP_LIST_ITEMS.name)
      shopListItemsStore.createIndex('shopListId', 'shopListId')
      createData = true
    }
  })
  if (createData) {
    await createInitialData(db)
  }
  return db
}
async function addNewStore(store: Store) {
  const db = await getDbConnection()
  await addStore(store.name, store.sId, db)
}

async function addStore(name: string, sId: string, db: IDBPDatabase) {
  const newStore = {
    sId,
    name 
  }
  db.put(STORES.STORES.name, newStore)
  const newUiStore: UiStore = {
    ...newStore,
    items: []
  }
  stores.value.push(newUiStore)
  return newUiStore
}

async function itemVariantPageAddToList(item: object) {
  console.log('itemVariantPageAddToList', item)
  const db = await getDbConnection()
  return await addShopListItem(
    item.listId,
    item.itemId,
    item.condition,
    item.minQ,
    item.maxQ,
    item.maxP,
    item.color,
    db
  )
}

async function addShopListItem(
  shopListId: number,
  itemId: number,
  condition: string,
  minQuantity: number,
  maxQuantity: number,
  maxPrice: number,
  colors: string,
  db: IDBPDatabase
) {
  const shopList = shopLists.value.find(list => list.id === shopListId)
  if (!shopList) {
    return
  }
  const item: ShopListItem = {
    shopListId,
    itemId,
    condition,
    minQuantity,
    maxQuantity,
    maxPrice,
    colors: colors.toString().split(',')
  }
  console.log('addShopListItem', shopList, item)
  db.put(STORES.SHOP_LIST_ITEMS.name, item)
  shopList.items.push(item)
}
async function addInvItem(
  db: IDBPDatabase,
  invId: number,
  store: UiStore,
  color: number,
  condition: string,
  quantity: number,
  price: number,
  itemId: number,
  item: UiItem
) {
  const invItem: InvItem = {
    storeId: store.sId,
    invId,
    itemId,
    condition,
    quantity,
    price,
    color
  }
  db.put(STORES.INVENTORY_ITEMS.name, invItem)
  const uiInvItem: UiInvItem = {
    item,
    ...invItem
  }
  store.items.push(uiInvItem)
}

async function addColor(
  db: IDBPDatabase,
  id: number,
  name: string,
) {
  const color: Color = {
    id,
    name
  }
  db.put(STORES.COLORS.name, color)
  colors.value[id] = color
}

async function addNewShopListItem(item) {
  const db = await getDbConnection()
  await addShopListItem(
    item.listId,
    item.itemId,
    item.condition,
    item.minQ,
    item.maxQ,
    item.maxP,
    item.colors,
    db
  )
}

async function getStoreItems(storeId: string) {
  const db = await getDbConnection()
  const tx = db.transaction(db.objectStoreNames, 'readonly')
  const objStore = tx.objectStore(STORES.INVENTORY_ITEMS.name)
  const index = objStore.index('storeId')
  if (!index) {
    return []
  }
  try {
    const storeItems = await index.getAll(storeId)
    for (let i = 0; i < storeItems.length; i++) {
      const storeItem = storeItems[i]
      storeItem.item = items.value.find(item => item.itemId === storeItem.itemId)
      storeItem.colorName = colors.value[storeItem.color].name
    }
    return storeItems
  } catch (e) {
    console.log('error getting store items', e, storeId)
  }

  return []
}

async function loadStores() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.STORES.name)
  for (let i = 0; i < x.length; i++) {
    const store = x[i]
    const items = await getStoreItems(store.sId)
    stores.value.push({
      name: store.name,
      sId: store.sId,
      items
    })
  }
  for (let i = 0; i < items.value.length; i++) {
    const item = items.value[i]
    for (let j = 0; j < item.variants.length; j++) {
      const variant = item.variants[j]
      for (let k = 0; k < variant.invItems.length; k++) {
        const invItem = variant.invItems[k]
        invItem.store = stores.value.find(store => store.sId === invItem.storeId)
      }
    }
  }
}
async function loadItemVariants(db: IDBPDatabase, item: Item) {
  const tx = db.transaction(db.objectStoreNames, 'readonly')
  const objStore = tx.objectStore(STORES.ITEM_IMAGES.name)
  const index = objStore.index('itemId')
  if (!index) {
    return []
  }
  try {
    const variants = await index.getAll(item.itemId)
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      variant.item = item
      variant.color = colors.value[variant.colorId]
      variant.invItems = await getVariantInvItems(db, variant, item)
    }
    return variants
  } catch (e) {
    console.log('error getting store items', e, item.itemId)
  }
  return []
}

async function loadShopListItems(db: IDBPDatabase, shopListId: string) {
  const tx = db.transaction(db.objectStoreNames, 'readonly')
  const objStore = tx.objectStore(STORES.SHOP_LIST_ITEMS.name)
  const index = objStore.index('shopListId')
  if (!index) {
    return []
  }
  try {
    const shopListItems = await index.getAll(shopListId)
    for (let i = 0; i < shopListItems.length; i++) {
      const shopListItem = shopListItems[i]
      shopListItem.item = items.value.find(item => item.itemId === shopListItem.itemId)
      shopListItem.colorNames = shopListItem.colors.map(colorId => colors.value[colorId])
    }
    return shopListItems
  } catch (e) {
    console.log('error getting shop list items', e, shopListId)
  }
  return []
}

async function loadItems() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.ITEMS.name)
  for (let i = 0; i < x.length; i++) {
    const item = x[i]
    item.variants = await loadItemVariants(db, item)
    items.value.push(item)
  }
}

const colors = ref({})
async function loadColors() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.COLORS.name)
  for (let i = 0; i < x.length; i++) {
    colors.value[x[i].id] = x[i]
  }
}

const searches = ref<Search[]>([])
async function loadSearches() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.SEARCHES.name)
  searches.value.push(...x)
}

async function loadShopLists() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.SHOP_LISTS.name)
  for (let i = 0; i < x.length; i++) {
    const list = x[i]
    list.items = await loadShopListItems(db, list.id)
    shopLists.value.push(list)
  }
}

onMounted(async () => {
  await loadColors()
  await loadItems()
  await loadStores()
  await loadShopLists()
  await loadSearches()
})

const page = ref('home')
watch(page, () => {
  window.scrollTo(0, 0)
})
function goStore(store: UiStore) {
  openStore.value = store
  page.value = 'store'
}
function goShopList(shopList: UiShopList) {
  openShopList.value = shopList
  page.value = 'shopList'
}
async function addShopList(name: string) {
  const db = await getDbConnection()
  return await addShopListDb(name, db)
}
async function addShopListDb(name: string, db: IDBPDatabase) {
  const id = await db.put(STORES.SHOP_LISTS.name, { name })
  if (!id) {
    return
  }
  const list: UiShopList = {
    id,
    name,
    items: []
  }
  shopLists.value.push(list)
}
const openItem = ref<UiItem | null>(null)
function goItem(item: UiItem) {
  openItem.value = item
  page.value = 'item'
}
function goVariant(variant: UiItemVariant) {
  openItemVariant.value = variant
  page.value = 'variant'
}
</script>
<template>
  <HomePage v-if="page === 'home'" v-model="page" />
  <StoresPage
    v-else-if="page === 'stores'"
    :stores="stores"
    @go-home="page = 'home'"
    @go-store="goStore"
    @add="addNewStore"
  />
  <ColorsPage
    v-else-if="page === 'colors'"
    :colors="colors"
    @go-home="page = 'home'"
  />
  <ItemsPage
    v-else-if="page === 'items'"
    :items="items"
    @go-home="page = 'home'"
    @go-item="goItem"
  />
  <ItemPage
    v-else-if="page === 'item' && openItem"
    :item="openItem"
    @go-home="page = 'home'"
    @go-items="page = 'items'"
    @go-variant="goVariant"
  />
  <ItemVariantPage
    v-else-if="page === 'variant' && openItemVariant"
    :lists="shopLists"
    :variant="openItemVariant"
    @go-home="page = 'home'"
    @go-items="page = 'items'"
    @go-item="page = 'item'"
    @go-store="goStore"
    @add-to-list="itemVariantPageAddToList"
  />
  <StorePage
    v-else-if="page === 'store'"
    :fetching="fetchingStoreInventory"
    :store="openStore"
    @go-home="page = 'home'"
    @go-stores="page = 'stores'"
    @go-item="goItem"
    @start-fetching="startFetching"
    @stop-fetching="stopFetching"
  />
  <ShoppingListsPage
    v-else-if="page === 'shopLists'"
    :lists="shopLists"
    @go-home="page = 'home'"
    @open="goShopList"
    @add="addShopList"
  />
  <ShoppingListPage
    v-else-if="page === 'shopList'"
    :list="openShopList"
    @go-home="page = 'home'"
    @add-item="addNewShopListItem"
    @go-item="goItem"
  />
  <SearchesPage v-else-if="page === 'searches'" :lists="shopLists" @go-home="page = 'home'" />
</template>

<style scoped></style>
