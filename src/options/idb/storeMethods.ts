import { IDBPDatabase } from "idb"
import { UiStore, ShippingCost, StoreType, StoresPageStore, StorePageStore, InvItem, Store, ItemVariant, CachedStore, CachedItemVariant, CachedInvItem } from "../types"
import { getDbConnection, liveObjectCache } from "./idb"
import { countInvItems, getStorePageInvItems } from "./invItems"
import { getFirstActiveSearch } from "./searches"
import { get } from "./db"
import STORES from './stores'

export const openStore = ref<UiStore | null>(null)

export async function addNewStore() {
  const db = await getDbConnection()
  await addStore('', 'abcd', [], '', 100, db)
}

export async function addStore(
  name: string,
  id: string,
  shippingCosts: ShippingCost[],
  slug: string,
  priceAdjustment: number,
  db: IDBPDatabase,
  type: StoreType = StoreType.BrickLink
) {
  const existingStore: Store = await get(db, STORES.STORES, id)
  const newStore: Store = {
    id,
    name,
    fetchPageIndex: existingStore?.fetchPageIndex || 1,
    fetchMaxPageIndex: existingStore?.fetchMaxPageIndex || 10,
    priceAdjustment,
    shippingCosts,
    slug,
    lastScraped: new Date(),
    type: type
  }
  db.put(STORES.STORES.name, newStore)
  const newUiStore: UiStore = {
    ...newStore,
    items: []
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
      priceAdjustment: store.priceAdjustment,
      shippingCosts: store.shippingCosts,
      slug: store.slug,
      type: store.type
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
  await addStore("Lego Pick a Brick", "lego-pick-a-brick", [
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 1200
    },
    {
      region: 'AT',
      cost: 600,
    },
  ], 'https://www.lego.com/de-at/pick-and-build/pick-a-brick', 100, db, StoreType.Lego)
  await addStore("BrickDom's Brick Shop", "1720918", [
    {
      region: 'AT',
      cost: 4750,
    },
  ], 'BrickDom', 98, db)
  await addStore("BT´s Brickshop", "1203949", [
    {
      region: 'AT',
      cost: 5000,
    },
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 10000
    },
  ], 'btsbrickshop', 98, db)
  await addStore("brickflip.at", "541603", [], 'BrickFlip', 100, db)
  await addStore("Steinemichl", "1801484", [
    {
      region: 'AT',
      cost: 4900,
    },
  ], 'michael06642010', 100, db)
  await addStore("Bunte Steinewelt", "1801484", [
    {
      region: 'AT',
      cost: 2380,
      maxWeight: 26000,
      maxOrderPrice: 99999
    },
  ], 'BunteSteinewelt', 100, db)
  await addStore("bricksbyaj", "1843556", [
    {
      region: 'AT',
      cost: 490,
      maxWeight: 2000,
    },
    {
      region: 'AT',
      cost: 1150,
      maxWeight: 10000,
    },
    {
      region: 'AT',
      cost: 1850,
      maxWeight: 30000,
    },
  ], 'bricksbyaj', 100, db)
  await addStore("Brickturtle", "739435", [
    {
      region: 'AT',
      cost: 430,
      maxWeight: 2000,
    },
    {
      region: 'AT',
      cost: 790,
      maxWeight: 4000,
    },
  ], 'neogap', 100, db)
  await addStore("BRICKMOUSE", "712635", [
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 60000,
    },
    {
      region: 'AT',
      cost: 990,
      maxWeight: 4000,
    },
    {
      region: 'AT',
      cost: 790,
      maxWeight: 2000,
    },
    {
      region: 'AT',
      cost: 650,
      maxWeight: 1000,
    },
    {
      region: 'AT',
      cost: 550,
      maxWeight: 400,
    },
    {
      region: 'AT',
      cost: 450,
      maxWeight: 200,
    },
  ], 'brickmouse', 100, db)
  await addStore("minifigmaestro", "2066952", [
    {
      region: 'AT',
      cost: 495,
      maxWeight: 2000,
    },
  ], 'minifigmaestro', 98, db)
  await addStore("BricksInClicks", "2624933", [
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 6000,
    },
  ], 'DDC26', 100, db)
  await addStore("Unsorted Brick", "2068227", [
    {
      region: 'AT',
      cost: 599,
    },
  ], 'UnsortedBrick', 100, db)
  await addStore("Vineyard Bricks e.U.", "1821152", [], 'jgutzwar97', 100, db)
  await addStore("Mocca Briggs", "1850805", [
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 2500,
      type: 'eco'
    },
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 3000,
      type: 'priority'
    },
  ], 'MoccaBriggs', 100, db)
  await addStore("Die Steinschleuder", "1832236", [], 'KleinerBandit', 100, db)
  await addStore("BunteSteinewelt", "1801484", [
    {
      cost: 1090,
      maxWeight: 750,
      maxOrderPrice: 5000
    },
    {
      cost: 1990,
      maxWeight: 4000,
      maxOrderPrice: 99999
    },
    {
      cost: 2380,
      maxWeight: 26000,
      maxOrderPrice: 99999
    }
  ], 'BunteSteinewelt', 100, db)
  await addStore("Magic Magnus", "52799", [
    {
      cost: 1090,
      maxWeight: 750,
      maxOrderPrice: 15000
    },
    {
      cost: 1990,
      maxWeight: 4000,
      maxOrderPrice: 99999
    },
    {
      cost: 2380,
      maxWeight: 26000,
      maxOrderPrice: 99999
    }
  ], 'MagicMagnus', 100, db)
  await addStore("bricks56218", "996237", [], 'Bricks56218', 100, db)
  await addStore("Bricks_4_everyone", "1962608", [
    {
      minOrderPrice: 500,
      maxWeight: 500,
      cost: 380
    },
    {
      minOrderPrice: 500,
      maxWeight: 3000,
      cost: 450
    },
    {
      minOrderPrice: 500,
      maxWeight: 10000,
      cost: 650
    },
    {
      minOrderPrice: 500,
      maxWeight: 30000,
      cost: 950
    },
    {
      minOrderPrice: 5500,
      cost: 0
    }
  ], 'RWR_Brixx', 99, db)
  await addStore("Bricks Austria", "3112575", [
    {
      region: 'AT',
      cost: 490
    },
    {
      region: 'AT',
      minOrderPrice: 6000,
      cost: 0
    },
  ], 'carinthia_brick', 100, db)
  await addStore("A brick per day...", "709693", [], 'stefxan', 100, db)
}

export async function getStore(storeId: string): Promise<Store | undefined> {
  return await liveObjectCache.getStore(storeId)
}

export async function getAllStores(db: IDBPDatabase): Promise<CachedStore[]> {
  return await db.getAll(STORES.STORES.name)
}

export async function getAllVariants(db: IDBPDatabase): Promise<CachedItemVariant[]> {
  return await db.getAll(STORES.PART_VARIANTS.name)
}

export async function getAllInvItems(db: IDBPDatabase): Promise<CachedInvItem[]> {
  return await db.getAll(STORES.INVENTORY_ITEMS.name)
}

export async function getStoresPageStores(): Promise<StoresPageStore[] | undefined> {
  const search = await getFirstActiveSearch(liveObjectCache.db)
  if (!search) {
    return
  }
  const stores = await getAllStores(liveObjectCache.db)
  const uiStores: StoresPageStore[] = []
  for (let i = 0; i < stores.length; i++) {
    const store = stores[i]
    const numInvItems = await countInvItems(liveObjectCache.db, store.id, search)
    let fetchPercent = 100*numInvItems / (store.fetchMaxPageIndex * (store.type === StoreType.BrickLink ? 100 : 400))
    if (store.fullyFetched) {
      fetchPercent = 100
    }
    uiStores.push({
      ...store,
      numInvItems,
      fetchPercent
    })
  }
  return uiStores
}

export async function getStorePageStore(id: string, type: 'BrickLink' | 'Lego' | 'Rebrickable'): Promise<StorePageStore | undefined> {
  console.log(id, type)
  const store = await liveObjectCache.getStore(id)
  if (!store) {
    return
  }
  const invItems = await getStorePageInvItems(id)
  return {
    ...store,
    items: invItems || [],
  }
}