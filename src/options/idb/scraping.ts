import { IDBPDatabase } from 'idb'
import { Store, StoreType } from '../types'
import { getBrickLinkPrices } from './getBrickLinkPrices'
import { getLegoPrices } from './getLegoPrices'
import { getDbConnection, importBrickLinkStores, liveObjectCache } from './idb'
import { getAllFromIndex, getFromIndex } from './db'
import INDICES from './indices'
import { getAllActiveStoreIds } from './storeMethods'
import { getActiveSearch } from './searches'
let stopFetch: boolean = false
let stopStoresFetch: boolean = false
export const fetchingStoreInventory = ref(false)
export const fetchingStores = ref(false)
export function stopFetching() {
  fetchingStoreInventory.value = false
  stopFetch = true
}
export function stopFetchingStores() {
  fetchingStores.value = false
  stopStoresFetch = true
}
let fetchPricesInterval: NodeJS.Timeout
let fetchStoresInterval: NodeJS.Timeout

async function getPrices() {
  const db = await getDbConnection()
  const blStore = await getBrickLinkFetchStore(db)
  if (blStore) {
    getBrickLinkPrices(db, blStore)
  }
  const legoStore = await getLegoFetchStore(db)
  if (legoStore) {
    getLegoPrices(db, legoStore)
  }
}

export async function startFetching() {
  if (fetchingStoreInventory.value) {
    return
  }
  stopFetch = false
  fetchingStoreInventory.value = true
  getPrices()
  fetchPricesInterval = setInterval(
    () => {
      if (stopFetch && fetchPricesInterval) {
        clearInterval(fetchPricesInterval)
        return
      }
      getPrices()
    },
    25000 + Math.floor(Math.random() * 5000)
  )
}
export async function startFetchingStores() {
  if (fetchingStores.value) {
    return
  }
  stopStoresFetch = false
  fetchingStores.value = true
  const db = await getDbConnection()
  await importBrickLinkStores(db)
  fetchStoresInterval = setInterval(
    () => {
      if (stopStoresFetch && fetchStoresInterval) {
        clearInterval(fetchStoresInterval)
        return
      }
      importBrickLinkStores(db)
    },
    150000 + Math.floor(Math.random() * 5000)
  )
}

async function getBrickLinkFetchStore(
  db: IDBPDatabase
): Promise<Store | undefined> {
  const oneYearAgo = new Date()
  const oneYearAhead = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1)

  const stores = await getAllFromIndex<Store>(
    db,
    INDICES.STORES_BY_TYPE_AND_LAST_SCRAPED,
    IDBKeyRange.bound(
      [StoreType.BrickLink, oneYearAgo],
      [StoreType.BrickLink, oneYearAhead]
    )
  )
  if (!stores) {
    return
  }
  const search = await liveObjectCache.getActiveSearch()
  if (!search) {
    return
  }
  const activeStoreIds = await getAllActiveStoreIds(db, search.id)
  if (!activeStoreIds) {
    return
  }
  for (let i = 0; i < stores.length; i++) {
    const store = stores[i]
    if (activeStoreIds.includes(store.id)) {
      return store
    }
  }
}

async function getLegoFetchStore(db: IDBPDatabase): Promise<Store | undefined> {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const store = await getFromIndex<Store>(
    db,
    INDICES.STORES_BY_TYPE_AND_LAST_SCRAPED,
    IDBKeyRange.bound(
      [StoreType.Lego, oneYearAgo],
      [StoreType.Lego, new Date()]
    )
  )
  return store
}

const partDetails: any[] = []
let partDetailsScrapePage = 1
let partScrapingInterval: undefined | NodeJS.Timeout
let stopPartScraping = false
let partDetailsMaxPage = 100
export function stopPartScrapingFn() {
  stopPartScraping = true
}
export async function startPartScraping() {
  scrapePartDetails()
  partScrapingInterval = setInterval(() => {
    if (stopPartScraping || partDetailsScrapePage > partDetailsMaxPage) {
      clearInterval(partScrapingInterval)
      return
    }
    scrapePartDetails()
  }, 30000)
}
async function scrapePartDetails() {
  const response = await fetch(
    `https://rebrickable.com/api/v3/lego/parts/?inc_part_details=1&inc_color_details=0&page_size=1000&page=${partDetailsScrapePage}&key=ec4ddb3b958aaa4edf379059e5f87d2e`,
    {
      headers: {
        accept: 'application/json',
        'accept-language': 'en,de;q=0.9,es;q=0.8,en-US;q=0.7',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        priority: 'u=1, i',
        'sec-ch-ua':
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
      },
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    }
  )
  partDetailsScrapePage++
  const json = await response.json()
  partDetailsMaxPage = Math.ceil(json.count / 1000) + 1
  partDetails.push(...json.results)
  console.log(partDetails)
}

export async function getStorePrices(store: Store) {
  switch (store.type) {
    case StoreType.Lego:
      getLegoPrices(liveObjectCache.db, store)
      break
    case StoreType.BrickLink:
    default:
      getBrickLinkPrices(liveObjectCache.db, store)
      break
  }
}
