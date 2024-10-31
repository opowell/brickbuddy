<script setup lang="ts">
import { useAppStore } from '@/stores/app.store'

import { openDB } from 'idb';

// const store = useAppStore()

const COLORS = {
  WHITE: 1,
  GREEN: 6,
}
const stores = ref([
  {
    sid: '709693',
    name: 'A brick per day...'
  },
  {
    sid: '3112575',
    name: 'Bricks Austria'
  }
])
const pieces = ref([
  {
    partNumber: '3622',
    name: 'Brick 1 x 3',
    quantity: 10,
    maxPrice: 15,
    colors: [COLORS.GREEN, COLORS.WHITE]
  },
  {
    partNumber: '3068',
    name: 'Tile 2 x 2',
    quantity: 20,
    maxPrice: 15,
    colors: []
  },
])

const storePrices = ref({})

  async function getPrices(storeId: string, i: number) {
    console.log('get prices', storeId, i)
    const response = await fetch("https://store.bricklink.com/ajax/clone/store/searchitems.ajax?sort=6&pgSize=100&pg=" + i + "&showHomeItems=0&sid=" + storeId, {
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
async function storeStores() {
  const db = await getDbConnection()
  stores.value.forEach((store) => {
    db.add('stores', {
      sid: store.sid,
      name: store.name
    })
  })
}
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

async function getDbConnection() {
  return await openDB('brickbuddy', 1, {
    upgrade(db) {
      db.createObjectStore('stores', {
        keyPath: 'sid',
        autoIncrement: false
      })
      db.createObjectStore('items', {
        keyPath: ['sid', 'invID'],
        autoIncrement: false
      })
    },
  })
}
const newStoreId = ref('')
const newStoreName = ref('')
async function addNewStore() {
  const db = await getDbConnection()
  const newStore = {
    sid: newStoreId.value,
    name: newStoreName.value
  }
  db.add('stores', newStore)
  stores.value.push(newStore)
}
</script>

<template>
  <h4>Stores</h4>
  <div v-for="store in stores" :key="store.sid">
    {{ store.name }}
  </div>
  <div>Id:<input v-model="newStoreId" type="text"></div>
  <div>Name:<input v-model="newStoreName" type="text"></div>
  <button @click="addNewStore">
    Add new
  </button>
  <button @click="storeStores">
    Store
  </button>
  <h4>Pieces</h4>
  <div v-for="piece in pieces" :key="piece.partNumber">
    {{ piece.quantity }}x {{ piece.name }} - {{ piece.maxPrice }}
  </div>
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
  <h4>Result</h4>
</template>

<style scoped></style>
