<script setup lang="ts">
import type { IDBPDatabase, IDBPTransaction} from 'idb';
import { openDB } from 'idb';

import STORES from './stores'
// import { useAppStore } from '@/stores/app.store'
// const store = useAppStore()

const DB_NAME = 'brickbuddy'

const storePrices = ref({})

async function getPrices(store: UiStore, i: number) {
  console.log('get prices', store, i)
  const response = await fetch(`https://store.bricklink.com/ajax/clone/store/searchitems.ajax?sort=6&pgSize=100&pg=${  i  }&showHomeItems=0&sid=${  storeId}`, {
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
  json.result.groups.forEach(group => {
    group.items.forEach(item => {
      if (!storePrices.value[store.sId][item.itemId]) {
        storePrices.value[store.sId][item.itemId] = []
      }
      storePrices.value[store.sId][item.itemId].push(item)
      console.log(item)
      addInvItem(db, store, item.colorID, item.condition, item.quantity, item.price, item.itemID)
    })
  })
}
let stopFetch: boolean = false
function stopFetching() {
  stopFetch = true
}
const stores = ref<UiStore[]>([])
let fetchPricesInterval: NodeJS.Timeout
async function startFetching() {
  stopFetch = false
  let i = 0
  const store = stores.value[0]
  fetchPricesInterval = setInterval(() => {
    if (stopFetch && fetchPricesInterval) {
      clearInterval(fetchPricesInterval)
      return
    }
    getPrices(store, i)
    i++
  }, 5000)
}
interface Store {
  sId: string
  name: string
}
interface UiStore extends Store {
  items: number
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
  const store1 = await addStore("Die Steinschleuder", "1832236", db)
  await addStore("Bricks Austria", "3112575", db)
  await addStore("A brick per day...", "709693", db)
  
  await addShopList("Board games 2024", db)
  
  await addInvItem(db, 123456, store1, 1, 'New', 243, 53, 86789)
  await addShopListItem(1, "87580", 'New', 10, 100, 20, 'red', db)

  await addItem(
    "27",
    11,
    86789,
    "Plate, Modified 2 x 2 with Groove and 1 Stud in Center (Jumper)",
    "87580",
    0,
    "A",
    "P",
    "//img.bricklink.com/ItemImage/PN/11/87580.png",
    "//img.bricklink.com/ItemImage/PN/11/87580.png",
    "//img.bricklink.com/ItemImage/PT/11/87580.t1.png",
    "//img.bricklink.com/ItemImage/PT/11/87580.t1.png",
    "//img.bricklink.com/ItemImage/PT/11/87580.t1.png",
    db
  )
  stores.value = []
  shopLists.value = []
}

interface Item {
  categoryString: string
  colorId: number
  itemId: number
  itemName: string
  itemNo: string
  itemSeq: number
  itemStatus: string
  itemType: string
  largeImg: string
  newItemImg: string
  newThumb1Img: string
  newThumb2Img: string
  smallImg: string
}
const items = ref<Item[]>([])

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
    colorId,
    itemId,
    itemName,
    itemNo,
    itemSeq,
    itemStatus,
    itemType,
    largeImg,
    newItemImg,
    newThumb1Img,
    newThumb2Img,
    smallImg,
  }
  db.add(STORES.ITEMS.name, newItem)
  items.value.push(newItem)
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
      const store = transaction.objectStore(STORES.INVENTORY_ITEMS.name)
      store.createIndex('storeId', 'storeId')
      createData = true
    }
  })
  if (createData) {
    await createInitialData(db)
  }
  return db
}
const newStoreId = ref('')
const newStoreName = ref('')

async function addNewStore() {
  const db = await getDbConnection()
  await addStore(newStoreName.value, newStoreId.value, db)
}

async function addStore(name: string, sId: string, db: IDBPDatabase) {
  const newStore = {
    sId,
    name 
  }
  db.add(STORES.STORES.name, newStore)
  const newUiStore: UiStore = {
    ...newStore,
    items: 0
  }
  stores.value.push(newUiStore)
  return newUiStore
}

interface ShopListItem {
  shopListId: number
  itemId: string
  condition: string,
  minQuantity: number,
  maxQuantity: number,
  maxPrice: number,
  colors: string[]
}

const shopListItems = ref<ShopListItem[]>([])

async function addShopListItem(shopListId: number, itemId: string, condition: string, minQuantity: number, maxQuantity: number, maxPrice: number, colors: string, db: IDBPDatabase) {
  const item: ShopListItem = {
    shopListId,
    itemId,
    condition,
    minQuantity,
    maxQuantity,
    maxPrice,
    colorIds: colors.split(',')
  }
  db.add(STORES.SHOP_LIST_ITEMS.name, item)
  shopListItems.value.push(item)
}
interface ShopList {
  id?: number
  name: string
}
interface UiShopList extends ShopList {
  items: number
}
async function addShopList(name: string, db: IDBPDatabase) {
  const list: ShopList = {
    name,
  }
  db.add(STORES.SHOP_LISTS.name, list)
  const uiList: UiShopList = {
    name: list.name,
    items: 15
  }
  shopLists.value.push(uiList)
}

const newShopListItemListId = ref<number>(-1)
const newShopListItemItemId = ref('')
const newShopListItemCondition = ref('')
const newShopListItemMinQuantity = ref<number>(0)
const newShopListItemMaxQuantity = ref<number>(0)
const newShopListItemMaxPrice = ref<number>(0)
const newShopListItemColors = ref<string>('')

interface InvItem {
  invId: number
  storeId: string
  itemId: number
  condition: string
  quantity: number
  price: number
  color: number
}
async function addInvItem(
  db: IDBPDatabase,
  invId: number,
  store: UiStore,
  color: number,
  condition: string,
  quantity: number,
  price: number,
  itemId: number
) {
  const item: InvItem = {
    storeId: store.sId,
    invId,
    itemId,
    condition,
    quantity,
    price,
    color
  }
  db.add(STORES.INVENTORY_ITEMS.name, item)
  store.items++
}

async function addNewShopListItem() {
  const db = await getDbConnection()
  await addShopListItem(
    newShopListItemListId.value,
    newShopListItemItemId.value,
    newShopListItemCondition.value,
    newShopListItemMinQuantity.value,
    newShopListItemMaxQuantity.value,
    newShopListItemMaxPrice.value,
    newShopListItemColors.value,
    db
  )
}

async function loadShopListItems() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.SHOP_LIST_ITEMS.name)
  shopListItems.value.push(...x)
}
async function getNumStoreItems(storeId: string) {
  const db = await getDbConnection()
  const tx = db.transaction(db.objectStoreNames, 'readonly')
  const objStore = tx.objectStore(STORES.INVENTORY_ITEMS.name)
  const index = objStore.index('storeId')
  if (!index) {
    return -1
  }
  try {
    const out = await index.count(storeId)
    return out
  } catch (e) {
    console.log('error getting numResults', e, storeId)
  }

  return -1
}

async function loadStores() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.STORES.name)
  for (let i = 0; i < x.length; i++) {
    const store = x[i]
    const numItems = await getNumStoreItems(store.sId)
    stores.value.push({
      name: store.name,
      sId: store.sId,
      items: numItems
    })
  }
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
  // console.log('onMounted')
  await loadShopListItems()
  await loadStores()
  await loadShopLists()
})

function analyse() {
  console.log('analyse')
}

</script>

<template>
  <h4>Analysis</h4>
  <button @click="analyse">
    Analyse
  </button>
  <table>
    <thead>
      <tr>
        <th />
        <th v-for="store in stores" :key="store.sId">
          {{ store.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in shopListItems" :key="`${item.shopListId }-${ item.itemId}`">
        <td>
          {{ item.minQuantity }}-{{ item.maxQuantity }}x {{ item.itemId }} / {{ item.condition }} / {{ item.colors }} - EURc {{ item.maxPrice }}
        </td>
      </tr>
    </tbody>
  </table>
  <h4>Stores</h4>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Inventory</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="store in stores" :key="store.sId">
        <td>
          {{ store.name }}
        </td>
        <td>
          {{ store.items }}
        </td>
      </tr>
    </tbody>
  </table>
  <h4>Shopping Lists</h4>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Items</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="list in shopLists" :key="list.id">
        <td>
          {{ list.name }}
        </td>
        <td>
          {{ list.items }}
        </td>
      </tr>
    </tbody>
  </table>
  <h4>ShopList Items</h4>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Condition</th>
        <th>MinQ</th>
        <th>MaxQ</th>
        <th>MaxP</th>
        <th>Colors</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in shopListItems" :key="`${item.shopListId }-${ item.itemId }-${ item.condition }-${ item.colors}`">
        <td>{{ item.itemId }}</td>
        <td>{{ item.condition }}</td>
        <td>{{ item.minQuantity }}</td>
        <td>{{ item.maxQuantity }}</td>
        <td>{{ item.maxPrice }}</td>
        <td>{{ item.colors }}</td>
      </tr>
    </tbody>
  </table>
  <h4>Items</h4>
  <table>
    <thead>
      <tr>
        <th>Images</th>
        <th>Category</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.itemId">
        <td><img :src="item.newThumb1Img"></td>
        <td>{{ item.categoryString }}</td>
        <td>{{ item.itemName }}</td>
      </tr>
    </tbody>
  </table>
  <h4>Prices</h4>
  <button @click="startFetching">
    Start fetching
  </button>
  <button @click="stopFetching">
    Stop fetching
  </button>
  <h4>Prices</h4>
  <div v-for="store in storePricesArray" :key="store.sId">
    <h5>{{ store.name }}</h5>
    <div v-for="item in store.items" :key="item.itemId">
      <div>{{ item.name }}</div>
      <div v-for="lot in item.lots" :key="lot.id">
        <span>{{ lot.colorName }}</span>
        <span>{{ lot.price }}</span>
        <span>{{ lot.quantity }}</span>
        <span>{{ lot.condition }}</span>
      </div>
    </div>
  </div>
  <h4>Add shop list item</h4>
  <div>Item Id:<input v-model="newShopListItemItemId" type="text"></div>
  <div>
    Condition:<select v-model="newShopListItemCondition">
      <option value="New">
        New
      </option>
      <option value="Used">
        Used
      </option>
    </select>
  </div>
  <div>Min quantity:<input v-model="newShopListItemMinQuantity" type="number"></div>
  <div>Max quantity:<input v-model="newShopListItemMaxQuantity" type="number"></div>
  <div>Max price:<input v-model="newShopListItemMaxPrice" type="number"></div>
  <div>Colors:<input v-model="newShopListItemColors" type="text"></div>
  <button @click="addNewShopListItem">
    Add
  </button>
  <h4>Add store</h4>
  <div>Id:<input v-model="newStoreId" type="text"></div>
  <div>Name:<input v-model="newStoreName" type="text"></div>
  <button @click="addNewStore">
    Add new
  </button>
</template>

<style scoped></style>
