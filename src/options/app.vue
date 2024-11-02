<script setup lang="ts">
import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';

import STORES from './stores'
import HomePage from './pages/HomePage.vue'
import StoresPage from './pages/StoresPage.vue'
import ColorsPage from './pages/ColorsPage.vue'
import ItemsPage from './pages/ItemsPage.vue'
import ItemPage from './pages/ItemPage.vue'
import StorePage from './pages/StorePage.vue'
import ShoppingListsPage from './pages/ShoppingListsPage.vue'
import ShoppingListPage from './pages/ShoppingListPage.vue'
import SearchesPage from './pages/SearchesPage.vue'
import type { Color, InvItem, Item, ItemVariant, Search, ShopList, ShopListItem, Store, UiInvItem, UiItem, UiShopList, UiStore } from './constants'
import { DB_NAME } from './constants'
const storePrices = ref({})
const openShopList = ref<UiShopList | null>(null)
async function  getPrices(store: UiStore, i: number) {
  console.log('get prices', store, i)
  const response = await fetch(`https://store.bricklink.com/ajax/clone/store/searchitems.ajax?sort=6&pgSize=100&pg=${i}&showHomeItems=0&sid=${store.sId}`, {
    "headers": {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en,de;q=0.9,es;q=0.8,en-US;q=0.7",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest"
    },
    "referrer": "https://store.bricklink.com/stefxan",
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
    // for (let j = 0; j < 1; j++) {
    for (let j = 0; j < group.items.length; j++) {
      const invItem = group.items[j]
      console.log(invItem)
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
          100*invItem.rawConvertedPrice,
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
function stopFetching() {
  stopFetch = true
}
const stores = ref<UiStore[]>([])
let fetchPricesInterval: NodeJS.Timeout
const openStore = ref<UiStore | null>(null)

async function startFetching() {
  console.log('startFetching')
  stopFetch = false
  let i = 0
  const store = openStore.value
  if (!store) {
    return
  }
  fetchPricesInterval = setInterval(() => {
    if (stopFetch && fetchPricesInterval) {
      clearInterval(fetchPricesInterval)
      return
    }
    getPrices(store, i)
    i++
  }, 5000)
}
const storePricesArray = computed(() => {
  const keys = Object.keys(storePrices.value)
  return keys.map((key) => {
    const price = storePrices.value[key]
    const priceKeys = Object.keys(price)
    return {
      sId: key,
      price,
      priceKeys,
      name: stores.value.find(store => store.sId === key)?.name,
      items: priceKeys.map((priceKey) => {
        return {
          id: priceKey,
          name: price[priceKey][0].itemName,
          lots: price[priceKey].map(lot => {
            return {
              colorId: lot.colorId,
              colorName: lot.colorName,
              price: lot.rawConvertedPrice,
              quantity: lot.invQty,
              condition: lot.invNew
            }
          }),
        }
      })
    }
  })
})
const shopLists = ref<UiShopList[]>([])

async function createInitialData(db: IDBPDatabase) {
  console.log('createInitialData')
  await addStore("Die Steinschleuder", "1832236", db)
  await addStore("Bricks Austria", "3112575", db)
  await addStore("A brick per day...", "709693", db)
  
  await addShopList("Board games 2024", db)
  
  await addShopListItem(1, "87580", 'New', 10, 100, 20, 'red', db)
  stores.value = []
  shopLists.value = []
}

const items = ref<UiItem[]>([])

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
  const uiItem = {
    ...newItem,
    variants: [variant]
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
      const itemVariantsStore = transaction.objectStore(STORES.ITEM_IMAGES.name)
      itemVariantsStore.createIndex('itemId', 'itemId')
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

async function addShopListItem(shopListId: number, itemId: string, condition: string, minQuantity: number, maxQuantity: number, maxPrice: number, colors: string, db: IDBPDatabase) {
  if (!openShopList.value) {
    return
  }
  const item: ShopListItem = {
    shopListId,
    itemId,
    condition,
    minQuantity,
    maxQuantity,
    maxPrice,
    colorIds: colors.split(',')
  }
  db.put(STORES.SHOP_LIST_ITEMS.name, item)
  openShopList.value.items.push(item)
}
async function addShopList(name: string, db: IDBPDatabase) {
  const list: ShopList = {
    name,
  }
  db.put(STORES.SHOP_LISTS.name, list)
  const uiList: UiShopList = {
    name: list.name,
    items: 15
  }
  shopLists.value.push(uiList)
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
    variants.forEach((variant) => {
      variant.color = colors.value[variant.colorId]
    })
    return variants
  } catch (e) {
    console.log('error getting store items', e, item.itemId)
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
  const y = x.map(list => {
    return {
      name: list.name,
      items: 25
    }
  })
  shopLists.value.push(...y)
}

onMounted(async () => {
  await loadColors()
  await loadItems()
  await loadStores()
  await loadShopLists()
  await loadSearches()
})

const page = ref('home')
function goStore(store: UiStore) {
  openStore.value = store
  page.value = 'store'
}
function goShopList(shopList: UiShopList) {
  openShopList.value = shopList
  page.value = 'shopList'
}
const openItem = ref<UiItem | null>(null)
function goItem(item: UiItem) {
  openItem.value = item
  page.value = 'item'
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
  />
  <StorePage
    v-else-if="page === 'store'"
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
  />
  <ShoppingListPage
    v-else-if="page === 'shopList'"
    :list="openShopList"
    @go-home="page = 'home'"
    @add-item="addNewShopListItem"
  />
  <SearchesPage v-else-if="page === 'searches'" :lists="shopLists" @go-home="page = 'home'" />
</template>

<style scoped></style>
