import { IDBPDatabase, openDB } from "idb";
import STORES from './stores'
import { Color, InvItem, Item, ItemVariant, Search, ShippingCost, ShopListItem, Store, UiInvItem, UiItem, UiItemVariant, UiSearch, UiShopList, UiStore } from "./types";
import { DB_NAME } from "./constants";
import { toDataURL } from "./utils";
import * as math from 'mathjs'

export const colors = ref({})
export const searches = ref<UiSearch[]>([])
export const stores = ref<UiStore[]>([])
export const shopLists = ref<UiShopList[]>([])
export const items = ref<UiItem[]>([])

export const openSearch = ref<UiSearch | null>(null)
export const openStore = ref<UiStore | null>(null)

async function getPrices() {
  const store = getFetchStore()
  if (!store) {
    return
  }
  const response = await fetch(`https://store.bricklink.com/ajax/clone/store/searchitems.ajax?sort=6&pgSize=100&pg=${store.fetchPageIndex}&showHomeItems=0&sid=${store.sId}`, {
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })
  store.fetchPageIndex++
  if (store.fetchPageIndex >= store.fetchMaxPageIndex) {
    store.fetchPageIndex = 1
  }
  const db = await getDbConnection()
  const json = await response.json()
  store.fetchMaxPageIndex = Math.ceil(json.result.totalLotCnt / 100) + 1
  updateStore(db, store)
  for (let i = 0; i < json.result.groups.length; i++) {
    const group = json.result.groups[i]
    for (let j = 0; j < group.items.length; j++) {
      const invItem = group.items[j]
      try {
        await addColor(db, invItem.colorID, invItem.colorName)
        const uiVariant = await addItem(
          invItem.categoryString,
          invItem.colorID,
          invItem.itemID,
          invItem.itemName,
          invItem.itemNo,
          invItem.itemSeq,
          invItem.itemStatus,
          invItem.itemType,
          invItem.newThumb1Img,
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
          uiVariant
        )
      } catch (e) {
        console.log('error adding item', invItem, e)
      }
    }
  }
}
let stopFetch: boolean = false
export const fetchingStoreInventory = ref(false)
export function stopFetching() {
  fetchingStoreInventory.value = false
  stopFetch = true
}
let fetchPricesInterval: NodeJS.Timeout

let fetchingStoreIndex = 0
export async function startFetching() {
  if (fetchingStoreInventory.value) {
    return
  }
  stopFetch = false
  fetchingStoreInventory.value = true
  getPrices()
  fetchPricesInterval = setInterval(() => {
    if (stopFetch && fetchPricesInterval) {
      clearInterval(fetchPricesInterval)
      return
    }
    getPrices()
  }, 15000)
}

function getFetchStore() {
  let store = openStore.value
  if (!store) {
    store = stores.value[fetchingStoreIndex]
    fetchingStoreIndex++
    if (fetchingStoreIndex >= stores.value.length) {
      fetchingStoreIndex = 0
    }
  }
  return store
}

async function fetchStores(search: string) {
  const db = await getDbConnection()
  return stores
}
export async function createInitialStores(db: IDBPDatabase) {
  if (!db) {
    db = await getDbConnection()
  }
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
  await addStore("MoccaBriggs", "1850805", [
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
  ], 'Mocca Briggs', 100, db)
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
async function createInitialData(db: IDBPDatabase) {
  await createInitialStores(db)  
  await addShopListDb("Board games 2024", db)
  
  stores.value = []
  shopLists.value = []
}

async function addItemNoVariant(
  db: IDBPDatabase,
  categoryString: string,
  itemId: string,
  itemName: string,
  itemNo?: string,
  itemSeq?: number,
  itemStatus?: string,
  itemType?: string,
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
  await db.put(STORES.PARTS.name, newItem)
  return newItem
}
async function addItem(
  categoryString: string,
  colorId: number,
  itemId: string,
  itemName: string,
  itemNo: string,
  itemSeq: number,
  itemStatus: string,
  itemType: string,
  newThumb1Img: string,
  db: IDBPDatabase
) {
  const newItem = await addItemNoVariant(
    db,
    categoryString,
    itemId,
    itemName,
    itemNo,
    itemSeq,
    itemStatus,
    itemType,
  )
  let variant: ItemVariant = await getItemVariant(db, itemId, colorId)
  if (!variant) {
    const image: string = await toDataURL('https:' + newThumb1Img)
    variant = {
      itemId,
      colorId,
      image
    }
  }
  await db.put(STORES.PART_VARIANTS.name, variant)
  let uiItem = items.value.find(item => item.itemId === itemId)
  if (!uiItem) {
    uiItem = {
      ...newItem,
      variants: []
    }
    items.value.push(uiItem)
  }
  const uiVariant: UiItemVariant = {
    ...variant,
    color: colors.value[variant.colorId],
    invItems: await getVariantInvItems(db, variant, newItem),
    item: uiItem
  }
  if (uiItem.variants.every(variant => variant.colorId !== variant.colorId)) {
    uiItem.variants.push(uiVariant)
  }
  return uiVariant
}

export async function getDbConnection() {
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
      const itemVariantsStore = transaction.objectStore(STORES.PART_VARIANTS.name)
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
export async function addNewStore(store: Store) {
  const db = await getDbConnection()
  await addStore(store.name, store.sId, [], '', 100, db)
}
export async function addNewSearch(name: string) {
  const db = await getDbConnection()
  await addSearch(name, db)
}

async function addStore(name: string, sId: string, shippingCosts: ShippingCost[], slug: string, priceAdjustment: number, db: IDBPDatabase) {
  const existingStore: Store = await db.get(STORES.STORES.name, sId)
  const newStore: Store = {
    sId,
    name,
    fetchPageIndex: existingStore?.fetchPageIndex || 1,
    fetchMaxPageIndex: existingStore?.fetchMaxPageIndex || 10,
    priceAdjustment,
    shippingCosts,
    slug
  }
  db.put(STORES.STORES.name, newStore)
  const newUiStore: UiStore = {
    ...newStore,
    items: []
  }
  stores.value.push(newUiStore)
  return newUiStore
}
async function updateStore(db: IDBPDatabase, store: Store | UiStore) {
  if (isProxy(store)) {
    store = toRaw(store)
  }
  try {
    const storeObj: Store = {
      sId: store.sId,
      name: store.name,
      fetchPageIndex: store.fetchPageIndex,
      fetchMaxPageIndex: store.fetchMaxPageIndex
    }
    console.log(storeObj)
    db.put(STORES.STORES.name, storeObj)
  } catch (e) {
    console.log(store, e)
  }
}

async function addSearch(name: string, db: IDBPDatabase) {
  const newSearch = {
    name,
    storeIds: []
  }
  db.put(STORES.SEARCHES.name, newSearch)
  const newUiSearch: UiSearch = {
    ...newSearch,
    stores: []
  }
  searches.value.push(newUiSearch)
  return newUiSearch
}

export async function itemVariantPageAddToList(item: object) {
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
  itemId: string,
  condition: string,
  minQuantity: number,
  maxQuantity: number,
  maxPrice: number,
  colors: string,
  db: IDBPDatabase
) {
  const shopList = shopLists.value.find(list => list.id === shopListId)
  console.log('addShopListItem', shopList, shopListId)
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
  await db.put(STORES.SHOP_LIST_ITEMS.name, item)
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
  itemId: string,
  variant: UiItemVariant
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
  await db.put(STORES.INVENTORY_ITEMS.name, invItem)
  const uiInvItem: UiInvItem = {
    item: variant.item,
    store,
    ...invItem
  }
  variant.invItems = variant.invItems.filter(invItem => invItem.invId !== invId)
  variant.invItems.push(uiInvItem)
  store.items = store.items.filter(invItem => invItem.invId !== invId)
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
  await db.put(STORES.COLORS.name, color)
  colors.value[id] = color
}

export async function addNewShopListItem(item) {
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

export async function loadModels() {
  await loadColors()
  await loadItems()
  await loadStores()
  await loadShopLists()
  await loadSearches()
}
async function loadStores() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.STORES.name)
  for (let i = 0; i < x.length; i++) {
    const store = x[i]
    const items = await getStoreItems(store.sId)
    stores.value.push({
      ...store,
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

export async function getItemVariant(
  db: IDBPDatabase,
  itemId: string,
  color: number
) {
  return db.get(STORES.PART_VARIANTS.name, [itemId, color])
}

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
    console.log('error getting variant inventory items', e, variant)
  }

  return []
}

export async function loadSearches() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.SEARCHES.name)
  for (let i = 0; i < x.length; i++) {
    const search = x[i]
    const uiSearch = {
      ...search,
      stores: []
    }
    if (search.shoppingListId) {
      uiSearch.shoppingList = shopLists.value.find(list => list.id === search.shoppingListId)
    }
    for (let j = 0; j < search.storeIds.length; j++) {
      const storeId = search.storeIds[j]
      uiSearch.stores.push(stores.value.find(store => store.sId === storeId))
    }
    searches.value.push(uiSearch)
  }
}

export async function loadColors() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.COLORS.name)
  for (let i = 0; i < x.length; i++) {
    colors.value[x[i].id] = x[i]
  }
}

export async function loadShopLists() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.SHOP_LISTS.name)
  for (let i = 0; i < x.length; i++) {
    const list = x[i]
    list.items = await loadShopListItems(db, list.id)
    shopLists.value.push(list)
  }
}

export async function loadItems() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.PARTS.name)
  for (let i = 0; i < x.length; i++) {
    const item = x[i]
    item.variants = await loadItemVariants(db, item)
    items.value.push(item)
  }
}

async function loadItemVariants(db: IDBPDatabase, item: Item) {
  const tx = db.transaction(db.objectStoreNames, 'readonly')
  const objStore = tx.objectStore(STORES.PART_VARIANTS.name)
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

export async function addShopList(name: string) {
  const db = await getDbConnection()
  return await addShopListDb(name, db)
}
export async function addSearchStore(storeId: string) {
  if (!openSearch.value) {
    return
  }
  const store = stores.value.find(store => store.sId === storeId)
  if (!store) {
    return
  }
  openSearch.value.storeIds.push(storeId)
  openSearch.value.stores?.push(store)
  const db = await getDbConnection()
  const search: Search = {
    id: openSearch.value.id,
    name: openSearch.value.name,
    shoppingListId: openSearch.value.shoppingListId,
    storeIds: [...openSearch.value.storeIds]
  }
  await db.put(STORES.SEARCHES.name, search)
}

export async function searchRemoveStore(store: UiStore) {
  if (!openSearch.value) {
    return
  }
  openSearch.value.storeIds.filter(id => id !== store.sId)
  const db = await getDbConnection()
  const search: Search = {
    id: openSearch.value.id,
    name: openSearch.value.name,
    shoppingListId: openSearch.value.shoppingListId,
    storeIds: [...openSearch.value.storeIds]
  }
  await db.put(STORES.SEARCHES.name, search)
}
export async function setSearchShopList(listId: number) {
  if (!openSearch.value) {
    return
  }
  openSearch.value.shoppingList = shopLists.value?.find(list => list.id === listId)
  openSearch.value.shoppingListId = listId
  const db = await getDbConnection()
  const search: Search = {
    id: openSearch.value.id,
    name: openSearch.value.name,
    shoppingListId: openSearch.value.shoppingListId,
    storeIds: [...openSearch.value.storeIds]
  }
  await db.put(STORES.SEARCHES.name, search)
}
async function addShopListDb(name: string, db: IDBPDatabase) {
  const id = await db.put(STORES.SHOP_LISTS.name, { name })
  if (!id) {
    return
  }
  const list: UiShopList = {
    id: Number(id),
    name,
    items: []
  }
  shopLists.value.push(list)
}
