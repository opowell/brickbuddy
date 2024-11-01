<script setup lang="ts">
import type { IDBPDatabase} from 'idb';
import { openDB } from 'idb';
// import { useAppStore } from '@/stores/app.store'
// const store = useAppStore()

const COLORS = {
  WHITE: 1,
  GREEN: 6,
}
const storePrices = ref({})

  async function getPrices(storeId: string, i: number) {
    console.log('get prices', storeId, i)
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
        if (!storePrices.value[storeId][item.itemID]) {
          storePrices.value[storeId][item.itemID] = []
        }
        storePrices.value[storeId][item.itemID].push(item)
        db.add('items', {
          sid: storeId,
          ...item
        })
      })
    })
  }
let stopFetch: boolean = false
function stopFetching() {
  stopFetch = true
}
let fetchPricesInterval: NodeJS.Timeout
async function startFetching() {
  stopFetch = false
  let i = 0
  const storeId = stores.value[0].id
  storePrices.value[storeId] = {}
  fetchPricesInterval = setInterval(() => {
    if (stopFetch && fetchPricesInterval) {
      clearInterval(fetchPricesInterval)
      return
    }
    getPrices(storeId, i)
    i++
  }, 5000)
}
interface Store {
  sid: string
  name: string
}
const stores = ref<Store[]>([])

const storePricesArray = computed(() => {
  const keys = Object.keys(storePrices.value)
  return keys.map((key) => {
    const price = storePrices.value[key]
    const priceKeys = Object.keys(price)
    return {
      sid: key,
      price,
      priceKeys,
      name: stores.value.find(store => store.sid === key)?.name,
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

const OBJECT_STORES = {
  COLORS: 'colors',
  STORES: 'stores',
  INVENTORY_ITEMS: 'inventoryItems',
  ITEMS: 'items',
  PIECES: 'pieces'
}

async function createInitialData(db: IDBPDatabase) {
  await addStore("Die Steinschleuder", "1832236", db)
  await addStore("Bricks Austria", "3112575", db)
  await addStore("A brick per day...", "709693", db)
  
  await addPiece("87580", 'New', 10, 100, 20, 'red', db)

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
}

interface Item {
  categoryString: string
  colorID: number
  itemID: number
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
  colorID: number,
  itemID: number,
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
    colorID,
    itemID,
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
  db.add(OBJECT_STORES.ITEMS, newItem)
  items.value.push(newItem)
}

async function getDbConnection() {
  let createData = false
  const db = await openDB('brickbuddy', 1, {
    async upgrade(db) {
      db.createObjectStore(OBJECT_STORES.STORES, {
        keyPath: 'sid',
        autoIncrement: false
      })
      db.createObjectStore(OBJECT_STORES.INVENTORY_ITEMS, {
        keyPath: ['sid', 'invID'],
        autoIncrement: false
      })
      db.createObjectStore(OBJECT_STORES.ITEMS, {
        keyPath: ['itemID'],
        autoIncrement: false
      })
      db.createObjectStore(OBJECT_STORES.PIECES, {
        keyPath: 'id',
        autoIncrement: true
      })
      db.createObjectStore(OBJECT_STORES.COLORS, {
        keyPath: 'colorID',
        autoIncrement: true
      })
      createData = true
    }
  })
  if (createData) {
    createInitialData(db)
  }
  return db
}
const newStoreId = ref('')
const newStoreName = ref('')

async function addNewStore() {
  const db = await getDbConnection()
  await addStore(newStoreName.value, newStoreId.value, db)
}

async function addStore(name: string, sid: string, db: IDBPDatabase) {
  const newStore = {
    sid,
    name 
  }
  db.add(OBJECT_STORES.STORES, newStore)
  stores.value.push(newStore)
}

interface Piece {
  id?: number
  itemID: string
  condition: string,
  minQuantity: number,
  maxQuantity: number,
  maxPrice: number,
  colors: string[]
}

const pieces = ref<Piece[]>([])

async function addPiece(itemID: string, condition: string, minQuantity: number, maxQuantity: number, maxPrice: number, colors: string, db: IDBPDatabase) {
  const newPiece = {
    itemID,
    condition,
    minQuantity,
    maxQuantity,
    maxPrice,
    colors: colors.split(',')
  }
  db.add(OBJECT_STORES.PIECES, newPiece)
  pieces.value.push(newPiece)
}

const newPieceItemID = ref('')
const newPieceCondition = ref('')
const newPieceMinQuantity = ref<number>(0)
const newPieceMaxQuantity = ref<number>(0)
const newPieceMaxPrice = ref<number>(0)
const newPieceColors = ref<string>('')

async function addNewPiece() {
  const db = await getDbConnection()
  await addPiece(
    newPieceItemID.value,
    newPieceCondition.value,
    newPieceMinQuantity.value,
    newPieceMaxQuantity.value,
    newPieceMaxPrice.value,
    newPieceColors.value,
    db
  )
}

async function loadPieces() {
  const db = await getDbConnection()
  const x = await db.getAll(OBJECT_STORES.PIECES)
  pieces.value.push(...x)
}
async function loadStores() {
  const db = await getDbConnection()
  const x = await db.getAll(OBJECT_STORES.STORES)
  stores.value.push(...x)
}

onMounted(() => {
  loadPieces()
  loadStores()
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
        <th v-for="store in stores" :key="store.sid">
          {{ store.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="piece in pieces" :key="piece.id">
        <td>
          {{ piece.minQuantity }}-{{ piece.maxQuantity }}x {{ piece.itemID }} / {{ piece.condition }} / {{ piece.colors }} - EURc {{ piece.maxPrice }}
        </td>
        <td v-for="store in stores" :key="`${piece.id }-${ store.sid}`">
          -
        </td>
      </tr>
    </tbody>
  </table>
  <h4>Stores</h4>
  <div v-for="store in stores" :key="store.sid">
    {{ store.name }}
  </div>
  <h4>Pieces</h4>
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
      <tr v-for="piece in pieces" :key="piece.id">
        <td>{{ piece.itemID }}</td>
        <td>{{ piece.condition }}</td>
        <td>{{ piece.minQuantity }}</td>
        <td>{{ piece.maxQuantity }}</td>
        <td>{{ piece.maxPrice }}</td>
        <td>{{ piece.colors }}</td>
      </tr>
    </tbody>
  </table>
  <h4>Items</h4>
  <table>
    <thead>
      <tr>
        <th>Image</th>
        <th>Category</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.itemID">
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
  <div v-for="store in storePricesArray" :key="store.sid">
    <h5>{{ store.name }}</h5>
    <div v-for="item in store.items" :key="item.itemID">
      <div>{{ item.name }}</div>
      <div v-for="lot in item.lots" :key="lot.id">
        <span>{{ lot.colorName }}</span>
        <span>{{ lot.price }}</span>
        <span>{{ lot.quantity }}</span>
        <span>{{ lot.condition }}</span>
      </div>
    </div>
  </div>
  <h4>Add piece</h4>
  <div>Item ID:<input v-model="newPieceItemID" type="text"></div>
  <div>
    Condition:<select v-model="newPieceCondition">
      <option value="New">
        New
      </option>
      <option value="Used">
        Used
      </option>
    </select>
  </div>
  <div>Min quantity:<input v-model="newPieceMinQuantity" type="number"></div>
  <div>Max quantity:<input v-model="newPieceMaxQuantity" type="number"></div>
  <div>Max price:<input v-model="newPieceMaxPrice" type="number"></div>
  <div>Colors:<input v-model="newPieceColors" type="text"></div>
  <button @click="addNewPiece">
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
