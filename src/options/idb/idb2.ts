import { CachedCart, CachedCartItem, CachedCategory, CachedColor, CachedExternalCategory, CachedExternalItem, CachedInvItem, CachedItem, CachedItemVariant, CachedList, CachedSearch, CachedSearchFilter, CachedStore, Cart, CategoriesPageCategory, CategoriesPageExternalCategory, Color, ExternalCategory, ExternalItem, InvItem, RebrickableItem, Search, SearchFilter, ShopList, Store } from './../types';
import { IDBPDatabase, openDB } from "idb";
import STORES from './stores'
import INDICES from './indices'
import { ActiveSearch, HomeData, RbColor } from "../types";
import { DB_NAME } from "./constants";
import { getDbConnection } from './idb';
import { getAllStores } from './storeMethods';

interface Cache {
  stores: Store[] | undefined
}

const objectCache: Ref<Cache> = ref({
  stores: undefined,
})

const homeData = computed(() => {
  if (!objectCache.value.stores) {
    return
  }
  return {
    numStores: objectCache.value.stores.length
  }
})

export async function getNumStores(db: IDBPDatabase): Promise<CachedStore[]> {
  return await db.getAll(STORES.STORES.name)
}

export async function getHomeData() {
  if (!objectCache.value.stores) {
    const db = await getDbConnection()
    objectCache.value.stores = await getAllStores(db)
  }
}