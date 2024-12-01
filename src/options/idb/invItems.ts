import { IDBPDatabase } from "idb"
import { InvItem, ColorPageInvItem, ItemVariant, Item, PartPageVariantInvItem, StorePageInvItem, UiInvItem, PartsPageVariantInvItem, Store, ExternalItem, Search, ActiveSearch, StoreType, StorePageExternalPart, StorePageInvItemItem } from "../types"
import { getColor } from "./colors"
import { countFromIndex, get, getAllFromIndex, getFromIndex } from "./db"
import { IndexDefinition } from "./indices"
import ObjectCacheClass from "./ObjectCacheClass"
import { getPart } from "./parts"
import { getActiveSearch, getActiveCart } from "./searches"
import { getStore } from "./storeMethods"
import { getItemVariant } from "./variants"
import STORES from './stores'
import INDICES from './indices'
import { getCartQuantity } from "./carts"
import { getScore } from "../utils"

export async function addInvItem(
  db: IDBPDatabase,
  invId: string,
  store: Store,
  colorId: string,
  condition: string,
  quantity: number,
  price: string,
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

export async function countInvItems(db: IDBPDatabase, storeId: string, search: ActiveSearch): Promise<number> {
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
    const store = await getStore(db, invItem.storeId)
    const type = store.type === StoreType.BrickLink ? 'BrickLink' : 'Lego'
    const variant: ItemVariant = await getItemVariant(db, type, invItem.itemId, id)
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

export async function getNumInvItemsByPart(db: IDBPDatabase, part: ExternalItem): Promise<number> {
  return await countFromIndex(db, INDICES.INV_ITEMS_BY_ITEM, part.externalItemId)
}
export async function getVariantsByPart(db: IDBPDatabase, part: ExternalItem): Promise<ItemVariant[]> {
  return await getAllFromIndex(db, INDICES.PART_VARIANTS_BY_PART, part.externalItemId)
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
      store: await getStore(db, invItem.storeId),
      cartQuantity: -1
    }
    partPageInvItems.push(partPageVariantInvItem)
  }
  return partPageInvItems
}

export async function getStorePageInvItem(objectCache: ObjectCacheClass, invItem: InvItem, type: "Lego" | "BrickLink"): Promise<StorePageInvItem | undefined> {
  const search = await getActiveSearch()
  const part: StorePageInvItemItem | undefined = await objectCache.getStorePageExternalPart(invItem, type)
  if (!part) {
    return
  }
  const color = await objectCache.getColor(invItem.colorId)
  if (!color) {
    return
  }
  const externalCategory = await objectCache.getExternalCategory(part.externalCategoryId, part.type)
  if (!externalCategory) {
    return
  }
  const category = await objectCache.getCategory(externalCategory.categoryId)
  if (!category) {
    return
  }
  const variant = await getFromIndex(objectCache.db, INDICES.PART_VARIANTS_BY_PART_AND_COLOR, [invItem.itemId, color.id])
  const allMatchingInvItems = new Map<string, InvItem>()
  const matchingParts = await getAllFromIndex(objectCache.db, INDICES.EXTERNAL_PARTS_BY_PART, part.itemId)
  for (let i = 0; i < matchingParts.length; i++) {
    const matchingPart = matchingParts[i]
    let matches: InvItem[] = []
    if (search.priceScoreIgnoreColor) {
      matches = await getAllFromIndex(objectCache.db, INDICES.INV_ITEMS_BY_ITEM, matchingPart.externalItemId)
    } else {
      matches = await getAllFromIndex(objectCache.db, INDICES.INV_ITEMS_BY_ITEM_AND_COLOR, [matchingPart.externalItemId, color.id])
    }
    matches.forEach((match) => allMatchingInvItems.set(match.storeId + '//' + match.invId, match))
  }
  if (!search) {
    return
  }
  const priceScoreString = getScore(Array.from(allMatchingInvItems.values()), search.priceScoreQuantity, invItem.price, true)
  const cart = await objectCache.getActiveCart()
  const cartQuantity = getCartQuantity(cart, invItem)
  return {
    ...invItem,
    item: part,
    colorName: color?.name,
    variant,
    priceScore: priceScoreString,
    cartQuantity,
    category: {
      id: category.id,
      externalCategories: [
        externalCategory
      ]
    }
  }
}

export async function getStorePageInvItems(db: IDBPDatabase, id: string): Promise<InvItem[]> {
  console.log('getStorePageInvItems')
  const search = await getActiveSearch()
  const invItems: InvItem[] = await getAllFromIndex(db, INDICES.INV_ITEMS_BY_STORE, id)
  return invItems
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

