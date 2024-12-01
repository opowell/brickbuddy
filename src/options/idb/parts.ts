import { IDBPDatabase } from "idb"
import { BrickLinkItem, CategoryPagePart, ExternalCategory, ExternalItem, InvItem, Item, ItemVariant, LegoItem, ObjectCache, PartPagePart, PartPageVariant, PartPageVariantInvItem, PartsPagePart, RebrickableItem, StorePageInvItemItem, StorePageItemVariant, StorePageVariant, UiItem, UiItemVariant, VariantPagePart } from "../types"
import { countFromIndex, get, getAllFromIndex, getFromIndex, put } from "./db"
import STORES from './stores'
import { toDataURL } from "../utils"
import { getItemVariant, getPartPageVariants, getPartsPageVariants, getUiPartVariants } from "./variants"
import { getDbConnection, getObjectCache, rbPartsBrickLinkId, rbPartsLegoId } from "./idb"
import INDICES from "./indices"
import { getNumInvItemsByPart, getPartPageInvItems } from "./invItems"
import ObjectCacheClass from "./ObjectCacheClass"
import { getActiveSearch, searchAllowsPart } from "./searches"

export async function addBrickLinkItem(
  colorId: string,
  blItem: BrickLinkItem,
  imageUrl: string,
  db: IDBPDatabase
) {
  blItem.type = "BrickLink"
  await putBrickLinkItem(db, blItem)

  let variant: ItemVariant = await getItemVariant(db, 'BrickLink', blItem.externalItemId, colorId)
  if (!variant) {
    const image: string = await toDataURL('https:' + imageUrl)
    variant = {
      itemId: blItem.externalItemId,
      colorId,
      image,
      type: 'BrickLink'
    }
    await putVariant(db, variant)
  }
}

async function putVariant(db: IDBPDatabase, variant: ItemVariant) {
  return await put(db, STORES.PART_VARIANTS, variant)
}

async function putRebrickableItem(db: IDBPDatabase, item: RebrickableItem) {
  item.type = "Rebrickable"
  return await db.put(STORES.EXTERNAL_PARTS.name, item)
}
async function putBrickLinkItem(db: IDBPDatabase, item: BrickLinkItem) {
  const existingItem = getBrickLinkItem(db, item.externalItemId)
  let newItem = item
  if (existingItem) {
    newItem = {
      ...existingItem,
      ...item
    }
  }
  return await db.put(STORES.EXTERNAL_PARTS.name, newItem)
}
async function putLegoItem(db: IDBPDatabase, item: LegoItem) {
  return await db.put(STORES.EXTERNAL_PARTS.name, item)
}
async function storeRebrickableItem(db: IDBPDatabase, item: RebrickableItem, brickLinkCategoryId: string = 'unknown') {
  await putRebrickableItem(db, item)
  if (item.brickLinkIds) {
    for (let i = 0; i < item.brickLinkIds.length; i++) {
      const blItem: BrickLinkItem = {
        externalItemId: item.brickLinkIds[i],
        itemId: item.itemId,
        type: "BrickLink",
        externalCategoryId: brickLinkCategoryId
      }
      await putBrickLinkItem(db, blItem)
    }
  }
  if (item.legoPartIds) {
    for (let i = 0; i < item.legoPartIds.length; i++) {
      const legoItem: LegoItem = {
        externalItemId: item.legoPartIds[i],
        itemId: item.itemId,
        type: "Lego",
        externalCategoryId: 'unknown' // TODO
      }
      await putLegoItem(db, legoItem)
    }
  }
}
export async function getBrickLinkItem(db: IDBPDatabase, brickLinkId: string, brickLinkCategoryId?: string): Promise<BrickLinkItem | undefined> {
  let blItem: BrickLinkItem = await getFromIndex(db, INDICES.EXTERNAL_PARTS_BY_TYPE_AND_EXTERNAL_ID, ['BrickLink', brickLinkId])
  if (!blItem) {
    const rebrickableItem: RebrickableItem | undefined = rbPartsBrickLinkId.get(brickLinkId)
    if (!rebrickableItem) {
      console.log('no item', brickLinkId, rebrickableItem, Object.keys(rbPartsBrickLinkId).includes(brickLinkId))
      return
    }
    const itemId = await put(db, STORES.PARTS, {})
    if (!itemId || typeof itemId !== 'number') {
      return
    }
    rebrickableItem.itemId = itemId
    await storeRebrickableItem(db, rebrickableItem, brickLinkCategoryId)
  }
  return await getFromIndex(db, INDICES.EXTERNAL_PARTS_BY_TYPE_AND_EXTERNAL_ID, ['BrickLink', brickLinkId])
}
export async function getLegoItem(db: IDBPDatabase, legoId: string): Promise<LegoItem | undefined> {
  let blItem: LegoItem = await getFromIndex(db, INDICES.EXTERNAL_PARTS_BY_TYPE_AND_EXTERNAL_ID, ['Lego', legoId])
  if (!blItem) {
    const rebrickableItem: RebrickableItem | undefined = rbPartsLegoId.get(legoId)
    if (!rebrickableItem) {
      console.log('no item', legoId, rebrickableItem, Object.keys(rbPartsLegoId).includes(legoId))
      return
    }
    const itemId = await put(db, STORES.PARTS, {})
    if (!itemId || typeof itemId !== 'number') {
      return
    }
    rebrickableItem.itemId = itemId
    await storeRebrickableItem(db, rebrickableItem)
  }
  return await getFromIndex(db, INDICES.EXTERNAL_PARTS_BY_TYPE_AND_EXTERNAL_ID, ['Lego', legoId])
}

export async function getCategoryPagePart(db: IDBPDatabase, part: Item): Promise<CategoryPagePart | undefined> {
  const p = await getUiPartFromPart(db, part)
  if (!p) {
    return
  }
  const numInvItems = await getNumInvItemsByPart(db, part)
  return {
    ...p,
    numInvItems
  }
}
export async function getPart(db: IDBPDatabase, partId: IDBValidKey): Promise<Item> {
  return await get(db, STORES.PARTS, partId)
}

export async function getNumParts(objectCache: ObjectCacheClass): Promise<number> {
  const parts = await getParts(objectCache)
  return parts.length
}

async function getExternalPartsByPart(db: IDBPDatabase, id: number) {
  return await getAllFromIndex(db, INDICES.EXTERNAL_PARTS_BY_PART)
}

async function getParts(objectCache: ObjectCacheClass): Promise<Item[]> {
  const search = await getActiveSearch()
  const parts: Item[] = await objectCache.db.getAll(STORES.PARTS.name)
  const filteredParts: Item[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const externalParts: ExternalItem[] = await getExternalPartsByPart(objectCache.db, part.itemId)
    let partAllowed = true
    for (let j = 0; j < externalParts.length; j++) {
      const externalPart = externalParts[j]
      const externalCategory = await getExternalCategory(objectCache, externalPart.externalCategoryId, externalPart.type)
      if (!externalCategory) {
        continue
      }
      const categoryId = externalCategory.categoryId
      if (search.categories.excluded.includes(categoryId)) {
        partAllowed = false
        break
      }
      if (search.categories.included.length > 0) {
        if (!search.categories.included.includes(categoryId)) {
          partAllowed = false
          break
        }
      }
    }
    if (partAllowed) {
      filteredParts.push(part)
    }
  }
  return filteredParts
}

export async function getPartPagePart(id: number): Promise<PartPagePart | undefined> {
  const db = await getDbConnection()
  const part: Item = await getPart(db, id)
  if (!part) {
    return
  }
  const externalParts: ExternalItem[] = await getExternalParts(db, part.itemId)
  const variants: PartPageVariant[] = await getPartPageVariants(db, part.itemId)
  const invItems: PartPageVariantInvItem[] = await getPartPageInvItems(db, part.itemId)
  return {
    ...part,
    variants,
    invItems,
    externalParts
  }
}

async function getExternalParts(db: IDBPDatabase, id: number): Promise<ExternalItem[]> {
  return await getAllFromIndex(db, INDICES.EXTERNAL_PARTS_BY_PART, id)
}

async function getUiPartFromPart(db: IDBPDatabase, part: Item, objectCache?: ObjectCache): Promise<UiItem | undefined> {
  if (!part) {
    console.log('getUiPartFromPart: error, no part', part)
    return
  }
  const variants: UiItemVariant[] = await getUiPartVariants(db, part.itemId + '', objectCache)
  return {
    ...part,
    variants
  }
}

export async function getPartsPageParts(): Promise<PartsPagePart[]> {
  const db = await getDbConnection()
  const objectCache = new ObjectCacheClass(db)
  const items: Item[] = await getParts(objectCache)
  const promises: Promise<PartsPagePart>[] = []
  items.forEach((item) => {
    promises.push(getPartsPagePart(item))
  })
  const partsPageParts = await Promise.all(promises)
  return partsPageParts
}

export async function getPartsPagePart(part: Item): Promise<PartsPagePart> {
  const db = await getDbConnection()
  const objectCache = await getObjectCache()
  const variants = await getPartsPageVariants(db, part, objectCache)
  // if (variants.length === 0) {
  //   console.log('no variants')
  //   continue
  // }
  const externalItems = await getPartsPageExternalItems(objectCache, part)
  return {
    ...part,
    variants,
    externalItems,
  }

}

interface PartsPageExternalItem extends ExternalItem {
  category: ExternalCategory
}
async function getPartsPageExternalItems(objectCache: ObjectCacheClass, item: Item): Promise<PartsPageExternalItem[]> {
  return getAllFromIndex(objectCache.db, INDICES.EXTERNAL_PARTS_BY_PART, item.itemId)
}

export async function getStorePagePart(id: string, objectCache?: ObjectCacheClass): Promise<StorePageInvItemItem | undefined> {
  const db = await getDbConnection()
  const part: Item = await get(db, STORES.PARTS, id)
  if (!part) {
    console.log('getUiPartFromPart: error, no part', part)
    return
  }
  if (!objectCache) {
    objectCache = new ObjectCacheClass(db)
  }
  const variants: ItemVariant[] = await getAllFromIndex(db, INDICES.PART_VARIANTS_BY_PART, part.itemId)
  const storePageVariants: StorePageVariant[] = []
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    const color = await objectCache.getColor(variant.colorId)
    if (!color) {
      continue
    }
    const invItems: InvItem[] = await getAllFromIndex(
        db,
        INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
        [variant.itemId, variant.colorId]
      )
    storePageVariants.push({
      ...variant,
      color,
      invItems
    })
  }
  const externalParts = await getPartsPageExternalItems(objectCache, part)
  for (let i = 0; i < externalParts.length; i++) {
    const externalPart = externalParts[i]
    if (externalPart.externalCategoryId) {
      externalPart.category = await getExternalCategory(objectCache, externalPart.externalCategoryId, externalPart.type)
    }
  }
  return {
    ...part,
    variants,
    externalParts
  }
}

export async function getStorePageExternalPart(invItem: InvItem, type: 'BrickLink' | 'Lego', objectCache?: ObjectCacheClass): Promise<StorePageInvItemItem | undefined> {
  const db = await getDbConnection()
  const externalPart: ExternalItem = await get(db, STORES.EXTERNAL_PARTS, [type, invItem.itemId])
  if (!externalPart) {
    console.log('getStorePageExternalPart: error, no part', invItem.itemId, type, invItem)
    return
  }
  if (!objectCache) {
    objectCache = new ObjectCacheClass(db)
  }
  const variants: ItemVariant[] = await getAllFromIndex(db, INDICES.PART_VARIANTS_BY_TYPE_AND_PART, [type, externalPart.itemId])
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    variant.color = await objectCache.getColor(variant.colorId)
    variant.invItems = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [variant.itemId, variant.colorId]
    )
  }
  const externalParts = await getPartsPageExternalItems(objectCache, externalPart.itemId)
  for (let i = 0; i < externalParts.length; i++) {
    const e = externalParts[i]
    if (e.categoryId) {
      e.category = await getExternalCategory(objectCache, externalPart.categoryId, externalPart.type)
    }
  }
  return {
    ...externalPart,
    variants,
    externalParts
  }
}

async function getExternalCategory(objectCache: ObjectCacheClass, id: IDBValidKey, type: string): Promise<ExternalCategory> {
  return await get(objectCache.db, STORES.EXTERNAL_CATEGORIES, [type, id])
}

export async function updatePart(
  db: IDBPDatabase,
  part: Item
) {
  await db.put(STORES.PARTS.name, part)
}

async function getExternalCategoriesByCategory(db: IDBPDatabase, id: number): Promise<ExternalCategory[]> {
  return await getAllFromIndex(db, INDICES.EXTERNAL_CATEGORIES_BY_CATEGORY, id)
}

async function getExternalPartsByTypeAndCategory(db: IDBPDatabase, externalCategory: ExternalCategory): Promise<ExternalItem[]> {
  return await getAllFromIndex(db, INDICES.EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY, [externalCategory.type, externalCategory.id])
}

export async function getPartsInCategory(db: IDBPDatabase, id: number): Promise<Item[]> {
  const search = await getActiveSearch()
  const externalCategories = await getExternalCategoriesByCategory(db, id)
  const externalParts = []
  for (let i = 0; i < externalCategories.length; i++) {
    const externalCategory = externalCategories[i]
    externalParts.push(...await getExternalPartsByTypeAndCategory(db, externalCategory))
  }
  const filteredParts = externalParts.filter(part => searchAllowsPart(db, search, part))
  const items: Item[] = []
  for (let i = 0; i < filteredParts.length; i++) {
    const fp = filteredParts[i]
    if (typeof fp.itemId !== 'number') {
      continue
    }
    items.push({ itemId: fp.itemId })
  }
  return items
}

export async function getUiPart(id: string, objectCache?: ObjectCache): Promise<UiItem | undefined> {
  const db = await getDbConnection()
  const part: Item = await get(db, STORES.PARTS, id)
  const uiPart = await getUiPartFromPart(db, part, objectCache)
  return uiPart
}
export async function getVariantPagePart(id: string, objectCache?: ObjectCache): Promise<VariantPagePart | undefined> {
  const db = await getDbConnection()
  const part: Item = await getPart(db, id)
  const uiPart = await getUiPartFromPart(db, part, objectCache)
  return uiPart
}

export async function addLegoItem(
  colorId: string,
  blItem: LegoItem,
  imageUrl: string,
  db: IDBPDatabase
) {
  blItem.type = "Lego"
  await putLegoItem(db, blItem)

  let variant: ItemVariant = await getItemVariant(db, blItem.itemId, colorId)
  if (!variant) {
    const image: string = await toDataURL('https:' + imageUrl)
    variant = {
      itemId: blItem.itemId,
      colorId,
      image
    }
    await putVariant(db, variant)
  }
}

export async function getNumPartsInCategory(db: IDBPDatabase, id: number): Promise<number> {
  const externalCategories: ExternalCategory[] = await getAllFromIndex(db, INDICES.EXTERNAL_CATEGORIES_BY_CATEGORY, id)
  let count = 0
  for (let i = 0; i < externalCategories.length; i++) {
    const category = externalCategories[i]
    count += await countFromIndex(db, INDICES.EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY, [category.type, category.categoryId])
  }
  return count
}

async function addItemNoVariant(
  db: IDBPDatabase,
  categoryId: string,
  itemId: string,
  itemName: string,
) {
  const existingItem = await get(db, STORES.PARTS, itemId)
  let newItem: Item = {
    categoryId,
    itemId,
    itemName,
  }
  if (existingItem) {
    newItem = {
      ...existingItem,
      ...newItem
    }
  }
  await put(db, STORES.PARTS, newItem)
  return newItem
}
