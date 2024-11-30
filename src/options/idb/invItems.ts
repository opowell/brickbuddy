import { IDBPDatabase } from "idb"
import * as math from "mathjs"
import { InvItem, SearchBase, ColorPageInvItem, ItemVariant, Item, PartPageVariantInvItem, StorePageInvItem, UiInvItem, PartsPageVariantInvItem, Store, ExternalItem } from "../types"
import { getColor, colors } from "./colors"
import { countFromIndex, get, getAllFromIndex, getFromIndex } from "./db"
import { getDbConnection } from "./idb"
import { IndexDefinition } from "./indices"
import ObjectCacheClass from "./ObjectCacheClass"
import { getPart, getUiPart } from "./parts"
import { getActiveSearch, getActiveCart } from "./searches"
import { getStore } from "./storeMethods"
import { getItemVariant } from "./variants"
import STORES from './stores'
import INDICES from './indices'
import { getCartQuantity } from "./carts"

export async function addInvItem(
  db: IDBPDatabase,
  invId: string,
  store: Store,
  colorId: string,
  condition: string,
  quantity: number,
  price: number,
  itemId: string,
) {
  let invItem: InvItem | undefined = await getInvItem(db, store.sId, invId)
  if (!invItem) {
    invItem = {
      storeId: store.sId,
      invId,
      itemId,
      condition,
      quantity: 0,
      price,
      colorId,
      condition_New: condition === 'New' ? 1 : 0,
      condition_Used: condition === 'Used' ? 1 : 0,
    }
  }
  invItem.quantity += quantity
  await db.put(STORES.INVENTORY_ITEMS.name, invItem)
}

export async function countInvItems(db: IDBPDatabase, storeId: string, search: SearchBase): Promise<number> {
  const conditions = search.conditions
  const entries = []
  for (let i = 0; i < conditions.excluded.length; i++) {
    entries.push({
      id: conditions.excluded[i],
      excluded: true
    })
  }
  for (let i = 0; i < conditions.included.length; i++) {
    entries.push({
      id: conditions.included[i],
      excluded: false
    })
  }
  if (entries.length > 0) {
    const sortedEntries = entries
      .sort((a, b) => a.id > b.id ? 1 : -1)
    const values = sortedEntries.map((entry) => entry.excluded ? 0 : 1)
    const indexName = sortedEntries.map(e => 'condition_' + e.id).join('_')
    const index: IndexDefinition = {
      keyPath: ['storeId', ...sortedEntries.map(e => e.id)],
      name: 'store_' + indexName,
      store: STORES.INVENTORY_ITEMS.name
    }
    return await countFromIndex(db, index, [storeId, ...values])
  }
  return await countFromIndex(db, INDICES.INV_ITEMS_BY_STORE, storeId)
}

export async function countInvItemsWithColor(db: IDBPDatabase, id: string): Promise<number> {
  return await countFromIndex(db, INDICES.INV_ITEMS_BY_COLORS, id)
}

export async function getInvItemsWithColor(db: IDBPDatabase, id: string): Promise<ColorPageInvItem[]> {
  const invItems: InvItem[] = await getAllFromIndex(db, INDICES.INV_ITEMS_BY_COLORS, id)
  const colorPageInvItems: ColorPageInvItem[] = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem = invItems[i]
    const part = await getPart(db, invItem.itemId)
    const color = await getColor(db, invItem.colorId)
    const variant: ItemVariant = await getItemVariant(db, invItem.itemId, id)
    colorPageInvItems.push({
      ...invItem,
      item: part,
      colorName: color.name,
      variant
    })
  }
  return colorPageInvItems
}

async function getInvItem(db: IDBPDatabase, storeId: string, invId: string): Promise<InvItem | undefined> {
  if (!db || !storeId || !invId) {
    return
  }
  return await db.get(STORES.INVENTORY_ITEMS.name, [storeId, invId])
}

export async function getInvItemFromId(db: IDBPDatabase, storeId: string, invItemId: string) {
  return get(db, STORES.INVENTORY_ITEMS, [storeId, invItemId])
}

export async function getNumInvItemsByPart(db: IDBPDatabase, part: Item): Promise<number> {
  return await countFromIndex(db, INDICES.INV_ITEMS_BY_ITEM, part.itemId)
}

export async function getPartPageInvItems(db: IDBPDatabase, itemId: number): Promise<PartPageVariantInvItem[]> {
  const invItems = await getAllFromIndex(
    db,
    INDICES.INV_ITEMS_BY_ITEM,
    itemId
  )
  const partPageInvItems = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem: InvItem = invItems[i]
    const partPageVariantInvItem: PartPageVariantInvItem = {
      ...invItem,
      color: await getColor(db, invItem.colorId),
      store: await getStore(db, invItem.storeId)
    }
    partPageInvItems.push(partPageVariantInvItem)
  }
  return partPageInvItems
}

export async function getStorePageInvItem(objectCache: ObjectCacheClass, invItem: InvItem, type: string): Promise<StorePageInvItem | undefined> {
  const search = await getActiveSearch()
  const part: ExternalItem | undefined = await objectCache.getStorePageExternalPart(invItem, type)
  if (!part) {
    return
  }
  const color = await objectCache.getColor(invItem.colorId)
  if (!color) {
    return
  }
  // const category = await objectCache.getCategory(part.categoryId)
  // if (!category) {
  //   return
  // }
  const variant = await getFromIndex(objectCache.db, INDICES.PART_VARIANTS_BY_PART_AND_COLOR, [invItem.itemId, color.id])
  let allMatchingInvItems
  if (search.priceScoreIgnoreColor) {
    allMatchingInvItems= await getAllFromIndex(objectCache.db, INDICES.INV_ITEMS_BY_ITEM, part.itemId)
  } else {
    allMatchingInvItems= await getAllFromIndex(objectCache.db, INDICES.INV_ITEMS_BY_ITEM_AND_COLOR, [part.itemId, color.id])
  } 
  if (!search) {
    return
  }
  const sortedItems = allMatchingInvItems.sort((a, b) => a.price - b.price)
  const targetQ = search.priceScoreQuantity
  let cost = 0
  let quantity = 0
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i]
    const toTake = Math.min(item.quantity, targetQ - quantity)
    try {
      quantity += toTake
      cost += item.price * toTake
    } catch (e) {
      console.log(e)
    }
    if (toTake >= targetQ) {
      break
    }
  }
  const cheapestPrice = cost / quantity
  const priceScore = math.number(math.divide(math.bignumber(invItem.price), math.bignumber(cheapestPrice)))
  const percent = math.number(math.multiply(100, math.number(math.subtract(priceScore, 1))))
  let sign = ''
  if (percent > 0) {
    sign = '+'
  }
  const priceScoreString = sign + percent.toFixed(2) + '%'
  const cart = await objectCache.getActiveCart()
  const cartQuantity = getCartQuantity(cart, invItem)
  return {
    ...invItem,
    item: part,
    colorName: color?.name,
    variant,
    priceScore: priceScoreString,
    cartQuantity,
  }
}

export async function getStorePageInvItems(db: IDBPDatabase, id: string): Promise<InvItem[]> {
  console.log('getStorePageInvItems')
  const search = await getActiveSearch()
  const invItems: InvItem[] = await getAllFromIndex(db, INDICES.INV_ITEMS_BY_STORE, id)
  return invItems
}

export async function getVariantInvItems(db: IDBPDatabase, variant: ItemVariant, item: Item): Promise<UiInvItem[]> {
  const search = await getActiveSearch()
  const conditions = search.conditions
  const uiInvItems: UiInvItem[] = []
  try {
    const storeItems: InvItem[] = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [item.itemId, variant.colorId]
    )
    for (let i = 0; i < storeItems.length; i++) {
      const storeItem = storeItems[i]
      if (conditions.excluded) {
        if (conditions.ids.includes(storeItem.condition)) {
          continue
        }
      } else {
        if (conditions.ids.length > 0 && !conditions.ids.includes(storeItem.condition)) {
          continue
        }
      }
      const color = await getColor(db, variant.colorId)
      if (!color) {
        continue
      }
      const colorName = color.name
      uiInvItems.push({
        ...storeItem,
        item,
        colorName
      })
    }
    return storeItems
  } catch (e) {
    console.log('error getting variant inventory items', e, variant)
  }

  return []
}

export async function getPartsPageVariantInvItems(db: IDBPDatabase, variant: ItemVariant, objectCache?: ObjectCacheClass): Promise<PartsPageVariantInvItem[]> {
  const search = await getActiveSearch()
  if (!objectCache) {
    objectCache = new ObjectCacheClass(db)
  }
  const conditions = search.conditions
  const uiInvItems: PartsPageVariantInvItem[] = []
  try {
    const storeItems: InvItem[] = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [variant.itemId, variant.colorId]
    )
    for (let i = 0; i < storeItems.length; i++) {
      const storeItem = storeItems[i]
      if (conditions.excluded.length) {
        if (conditions.excluded.includes(storeItem.condition)) {
          continue
        }
      }
      if (conditions.included.length > 0 && !conditions.included.includes(storeItem.condition)) {
        continue
      }
      const color = await objectCache.getColor(variant.colorId)
      if (!color) {
        continue
      }
      uiInvItems.push({
        ...storeItem,
      })
    }
    return uiInvItems
  } catch (e) {
    console.log('error getting variant inventory items', e, variant)
  }
  return []
}

export async function getPartPageVariantInvItems(db: IDBPDatabase, variant: ItemVariant): Promise<PartPageVariantInvItem[]> {
  const activeCart = await getActiveCart()
  const invItems = await getAllFromIndex(
    db,
    INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
    [variant.itemId, variant.colorId]
  )
  const partPageVariantInvItems = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem: InvItem = invItems[i]
    const cartQuantity = getCartQuantity(activeCart, invItem)
    const partPageVariantInvItem: PartPageVariantInvItem = {
      ...invItem,
      cartQuantity,
      color: await getColor(db, invItem.colorId),
      store: await getStore(db, invItem.storeId)
    }
    partPageVariantInvItems.push(partPageVariantInvItem)
  }
  return partPageVariantInvItems
}

export async function getStoreItems(storeId: string) {
  const db = await getDbConnection()
  try {
    const storeItems = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_STORE,
      storeId
    )
    for (let i = 0; i < storeItems.length; i++) {
      const storeItem = storeItems[i]
      storeItem.item = await getUiPart(storeItem.itemId)
      storeItem.colorName = colors.value[storeItem.color].name
    }
    return storeItems
  } catch (e) {
    console.log('error getting store items', e, storeId)
  }

  return []
}

