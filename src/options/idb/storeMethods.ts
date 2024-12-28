import { IDBPDatabase } from 'idb'
import {
  UiStore,
  ShippingCost,
  StoreType,
  StoresPageStore,
  StorePageStore,
  InvItem,
  Store,
  ItemVariant,
  CachedStore,
  CachedItemVariant,
  CachedInvItem,
  SearchStore,
  SearchFilter,
} from '../types'
import { getDbConnection, liveObjectCache } from './idb'
import { countInvItems, getStorePageInvItems } from './invItems'
import { getFirstActiveSearch } from './searches'
import { get, getAllFromIndex, getAllKeysFromIndex } from './db'
import STORES from './stores'
import indices from './indices'
import { BOOLEAN_AS_NUMBER } from './utils'

export const openStore = ref<UiStore | null>(null)

export async function addStore(
  name: string,
  id: string,
  shippingCosts: ShippingCost[],
  slug: string,
  priceAdjustment: number,
  db: IDBPDatabase,
  type: StoreType = StoreType.BrickLink,
  countryId: string
) {
  const existingStore = await get<Store>(db, STORES.STORES, id)
  if (existingStore) {
    return
  }
  const newStore: Store = {
    id,
    name,
    fetchPageIndex: 1,
    fetchMaxPageIndex: 10,
    priceAdjustment,
    shippingCosts,
    slug,
    lastScraped: new Date(),
    type: type,
    countryId,
  }
  db.put(STORES.STORES.name, newStore)
  const newUiStore: UiStore = {
    ...newStore,
    items: [],
  }
  return newUiStore
}
export async function updateStore(db: IDBPDatabase, store: Store | UiStore) {
  if (isProxy(store)) {
    store = toRaw(store)
  }
  try {
    const storeObj: Store = {
      id: store.id,
      name: store.name,
      fetchPageIndex: store.fetchPageIndex,
      fetchMaxPageIndex: store.fetchMaxPageIndex,
      lastScraped: store.lastScraped,
      fullyFetched: store.fullyFetched,
      priceAdjustment: store.priceAdjustment,
      shippingCosts: store.shippingCosts,
      slug: store.slug,
      type: store.type,
      countryId: store.countryId,
    }
    await db.put(STORES.STORES.name, storeObj)
  } catch (e) {
    console.log(store, e)
  }
}

export async function createInitialStores(db: IDBPDatabase) {
  if (!db) {
    db = await getDbConnection()
  }
  await addStore(
    'Lego Pick a Brick',
    'lego-pick-a-brick',
    [
      {
        region: 'AT',
        cost: 0,
        minOrderPrice: 1200,
      },
      {
        region: 'AT',
        cost: 600,
      },
    ],
    'https://www.lego.com/de-at/pick-and-build/pick-a-brick',
    100,
    db,
    StoreType.Lego,
    '-'
  )
}

export async function getStore(storeId: string): Promise<Store | undefined> {
  return await liveObjectCache.getStore(storeId)
}

export async function getAllStores(db: IDBPDatabase): Promise<CachedStore[]> {
  return await db.getAll(STORES.STORES.name)
}

export async function getAllActiveStores(
  db: IDBPDatabase,
  searchId: number
): Promise<Store[] | undefined> {
  const ids = await liveObjectCache.getAllActiveStoreIds(searchId)
  if (!ids) {
    return
  }
  const stores: Store[] = []
  for (let i = 0; i < ids.length; i++) {
    const store = await getStore(ids[i])
    if (!store) {
      continue
    }
    stores.push(store)
  }
  return stores
}
export async function getAllActiveStoreIds(
  db: IDBPDatabase,
  searchId: number
): Promise<string[] | undefined> {
  const storeIds = new Map<string, boolean>()
  const countryFilters = await getAllFromIndex<SearchFilter>(
    db,
    indices.SEARCH_FILTERS_BY_SEARCH_TYPE,
    [searchId, 'storeCountry']
  )
  if (!countryFilters) {
    return
  }
  const includedCountries = countryFilters
    .filter((f) => !f.isExcluded)
    .map((f) => f.objectId)
  for (let i = 0; i < includedCountries.length; i++) {
    const countryStoreIds = await getAllKeysFromIndex(
      db,
      indices.STORES_BY_COUNTRY,
      includedCountries[i]
    )
    if (!countryStoreIds) {
      continue
    }
    // @ts-ignore
    countryStoreIds.forEach((id) => storeIds.set(id, true))
  }

  const storeFilters = await getAllFromIndex<SearchFilter>(
    db,
    indices.SEARCH_FILTERS_BY_SEARCH_TYPE,
    [searchId, 'store']
  )
  if (!storeFilters) {
    return
  }
  const excludedCountries = countryFilters
    .filter((f) => !f.isExcluded)
    .map((f) => f.objectId)
  // @ts-ignore
  // TODO:
  // excludedStores.forEach((id) => storeIds.set(id, true))
  const includedStores = storeFilters
    .filter((f) => !f.isExcluded)
    .map((f) => f.objectId)
  // @ts-ignore
  includedStores.forEach((id) => storeIds.set(id, true))
  if (includedCountries.length === 0 && includedStores.length === 0) {
    // @ts-ignore
    const keys = await db.getAllKeys(STORES.STORES.name)
    keys.forEach((key) => {
      // @ts-ignore
      storeIds.set(key, true)
    })
  } else {
    const legoIds = await getAllKeysFromIndex(
      liveObjectCache.db,
      indices.STORES_BY_TYPE,
      StoreType.Lego
    )
    if (legoIds) {
      // @ts-ignore
      legoIds.forEach((id) => storeIds.set(id, true))
    }
  }
  // @ts-ignore
  const excludedIds: string[] = storeFilters
    .filter((f) => f.isExcluded)
    .map((f) => f.objectId)

  if (excludedIds.length > 0) {
    excludedIds.forEach((id) => storeIds.delete(id))
  }
  return Array.from(storeIds.keys())
}

export async function getAllVariants(
  db: IDBPDatabase
): Promise<CachedItemVariant[]> {
  return await db.getAll(STORES.PART_VARIANTS.name)
}

export async function getAllInvItems(
  db: IDBPDatabase
): Promise<CachedInvItem[]> {
  return await db.getAll(STORES.INVENTORY_ITEMS.name)
}

export async function getCountryPageStores(): Promise<
  StoresPageStore[] | undefined
> {
  const search = await getFirstActiveSearch(liveObjectCache)
  if (!search) {
    return
  }
  const stores = await getAllActiveStores(liveObjectCache.db, search.id)
  if (!stores) {
    return
  }
  const uiStores: StoresPageStore[] = []
  for (let i = 0; i < stores.length; i++) {
    const store = stores[i]
    const numInvItems = await countInvItems(
      liveObjectCache.db,
      store.id,
      search
    )
    let fetchPercent =
      (100 * numInvItems) /
      (store.fetchMaxPageIndex *
        (store.type === StoreType.BrickLink ? 100 : 400))

    if (store.type === StoreType.BrickLink) {
      if (numInvItems > store.fetchPageIndex * 100) {
        store.fullyFetched = true
        updateStore(liveObjectCache.db, store)
      }
    }

    if (store.fullyFetched) {
      fetchPercent = 100
    }
    uiStores.push({
      ...store,
      numInvItems,
      fetchPercent,
    })
  }
  return uiStores
}

export async function getStoresPageStores(): Promise<
  StoresPageStore[] | undefined
> {
  const search = await getFirstActiveSearch(liveObjectCache)
  if (!search) {
    return
  }
  const stores = await getAllActiveStores(liveObjectCache.db, search.id)
  if (!stores) {
    return
  }
  const uiStores: StoresPageStore[] = []
  for (let i = 0; i < stores.length; i++) {
    const store = stores[i]
    const numInvItems = await countInvItems(
      liveObjectCache.db,
      store.id,
      search
    )
    let fetchPercent =
      (100 * numInvItems) /
      (store.fetchMaxPageIndex *
        (store.type === StoreType.BrickLink ? 100 : 400))

    if (store.type === StoreType.BrickLink) {
      if (numInvItems > store.fetchPageIndex * 100) {
        store.fullyFetched = true
        updateStore(liveObjectCache.db, store)
      }
    }

    if (store.fullyFetched) {
      fetchPercent = 100
    }
    uiStores.push({
      ...store,
      numInvItems,
      fetchPercent,
    })
  }
  return uiStores
}

export async function getStorePageStore(
  id: string,
  type: 'BrickLink' | 'Lego' | 'Rebrickable'
): Promise<StorePageStore | undefined> {
  const store = await liveObjectCache.getStore(id)
  if (!store) {
    return
  }
  const invItems = await getStorePageInvItems(id)
  if (!invItems) {
    return
  }
  invItems.forEach((invItem) => {
    liveObjectCache.loadStorePageInvItem(invItem)
  })
  return {
    ...store,
    items: invItems,
  }
}
