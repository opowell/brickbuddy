<script setup lang="ts">
import { useAppStore } from '@/stores/app.store'

// const store = useAppStore()

const COLORS = {
  WHITE: 1,
  GREEN: 6,
}
const stores = ref([
  {
    id: '709693',
    name: 'A brick per day...'
  },
  {
    id: '3112575',
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
    json.result.groups.forEach(group => {
      group.items.forEach(item => {
        if (!storePrices.value[storeId][item.itemID]) {
          storePrices.value[storeId][item.itemID] = []
        }
        storePrices.value[storeId][item.itemID].push(item)
      })
    })
  }
let stopFetch: boolean = false
function stopFetching() {
  stopFetch = true
}
let fetchPricesInterval: NodeJS.Timeout
function startFetching() {
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
      id: key,
      price,
      priceKeys,
      name: stores.value.find(store => store.id === key)?.name,
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
</script>

<template>
  <h4>Stores</h4>
  <div v-for="store in stores" :key="store.id">
    {{ store.name }}
  </div>
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
  <div v-for="store in storePricesArray" :key="store.id">
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
