import { IDBPDatabase } from "idb"
import { BrickLinkItem, CategoryPagePart, ExternalCategory, ExternalItem, Item, ItemVariant, LegoItem, ObjectCache, PartPagePart, PartPageVariant, PartPageVariantInvItem, PartsPagePart, RebrickableItem, StorePageInvItemItem, UiItem, UiItemVariant, VariantPagePart } from "../types"
import { countFromIndex, get, getAllFromIndex, getFromIndex, put } from "./db"
import STORES from './stores'
import { toDataURL } from "../utils"
import { getItemVariant, getPartPageVariants, getPartsPageVariants, getUiPartVariants } from "./variants"
import { getCategory } from "./categories"
import { colors, getColor } from "./colors"
import { getDbConnection, getObjectCache, rbPartsBrickLinkId } from "./idb"
import INDICES from "./indices"
import { getNumInvItemsByPart, getPartPageInvItems, getVariantInvItems } from "./invItems"
import ObjectCacheClass from "./ObjectCacheClass"
import { getActiveSearch, searchAllowsPart } from "./searches"

export async function addBrickLinkItem(
  colorId: string,
  blItem: BrickLinkItem,
  item: Item,
  imageUrl: string,
  db: IDBPDatabase
) {
  blItem.type = "BrickLink"
  await putBrickLinkItem(db, blItem)

  let variant: ItemVariant = await getItemVariant(db, item.itemId, colorId)
  if (!variant) {
    const image: string = await toDataURL('https:' + imageUrl)
    variant = {
      itemId: item.itemId,
      colorId,
      image
    }
    await putVariant(db, variant)
  }
}

async function putVariant(db: IDBPDatabase, variant: ItemVariant) {
  return await put(db, STORES.PART_VARIANTS, variant)
}

export async function addItem(
  categoryId: string,
  colorId: string,
  itemId: string | number,
  itemName: string,
  itemNo: string,
  itemSeq: number,
  itemStatus: string,
  itemType: string,
  newThumb1Img: string,
  db: IDBPDatabase
) {
  itemId = itemId + ''
  const newItem = await addItemNoVariant(
    db,
    categoryId,
    itemId,
    itemName,
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
  const uiItem = await getUiPart(itemId)
  if (!uiItem) {
    return
  }
  const uiVariant: UiItemVariant = {
    ...variant,
    color: await getColor(db, variant.colorId),
    invItems: await getVariantInvItems(db, variant, newItem),
    item: uiItem
  }
  return uiVariant
}

async function putRebrickableItem(db: IDBPDatabase, item: RebrickableItem) {
  item.type = "Rebrickable"
  return await db.put(STORES.EXTERNAL_PARTS.name, item)
}
async function putBrickLinkItem(db: IDBPDatabase, item: BrickLinkItem) {
  return await db.put(STORES.EXTERNAL_PARTS.name, item)
}
async function putLegoItem(db: IDBPDatabase, item: LegoItem) {
  return await db.put(STORES.EXTERNAL_PARTS.name, item)
}
async function storeRebrickableItem(db: IDBPDatabase, item: RebrickableItem) {
  await putRebrickableItem(db, item)
  if (item.brickLinkIds) {
    for (let i = 0; i < item.brickLinkIds.length; i++) {
      const blItem: BrickLinkItem = {
        externalItemId: item.brickLinkIds[i],
        itemId: item.itemId,
        type: "BrickLink"
      }
      await putBrickLinkItem(db, blItem)
    }
  }
  if (item.legoPartIds) {
    for (let i = 0; i < item.legoPartIds.length; i++) {
      const legoItem: LegoItem = {
        externalItemId: item.legoPartIds[i],
        itemId: item.itemId,
        type: "Lego"
      }
      await putLegoItem(db, legoItem)
    }
  }
}
async function storeItem(db: IDBPDatabase, item: Item) {
  await put(db, STORES.PARTS, item)
  if (item.brickLinkIds) {
    for (let i = 0; i < item.brickLinkIds.length; i++) {
      const blItem: BrickLinkItem = {
        brickLinkId: item.brickLinkIds[i],
        name: '',
        partId: item.itemId
      }
      await put(db, STORES.PARTS_BRICK_LINK, blItem)
    }
  }
  if (item.legoPartIds) {
    for (let i = 0; i < item.legoPartIds.length; i++) {
      const legoItem: LegoItem = {
        legoId: item.legoPartIds[i],
        name: '',
        partId: item.itemId
      }
      await put(db, STORES.PARTS_LEGO, legoItem)
    }
  }
}
export async function getBrickLinkItem(db: IDBPDatabase, brickLinkId: string): Promise<BrickLinkItem | undefined> {
  let blItem: BrickLinkItem = await getFromIndex(db, INDICES.EXTERNAL_PARTS_BY_TYPE_AND_EXTERNAL_ID, ['BrickLink', brickLinkId])
  if (!blItem) {
    const rebrickableItem: RebrickableItem | undefined = rbPartsBrickLinkId.get(brickLinkId)
    if (!rebrickableItem) {
      console.log('no item', brickLinkId, rebrickableItem, Object.keys(rbPartsBrickLinkId).includes(brickLinkId))
      return
    }
    const itemId = await put(db, STORES.PARTS, {})
    if (!itemId) {
      return
    }
    rebrickableItem.itemId = itemId
    await storeRebrickableItem(db, rebrickableItem)
  }
  blItem = await getFromIndex(db, INDICES.EXTERNAL_PARTS_BY_TYPE_AND_EXTERNAL_ID, ['BrickLink', brickLinkId])
  if (!blItem) {
    return
  }
  blItem.part = await getPart(db, blItem.itemId)
  return blItem
}
export async function getLegoItem(db: IDBPDatabase, legoId: string): Promise<LegoItem | undefined> {
  let blItem: LegoItem = await get(db, STORES.PARTS_LEGO, legoId)
  if (!blItem) {
    const item: Item = rbPartsLegoId[legoId]
    if (item) {
      await storeItem(db, item)
    } else {
      // console.log('no item', legoId, item, Object.keys(rbPartsLegoId).includes(legoId))
    }
  }
  blItem = await get(db, STORES.PARTS_LEGO, legoId)
  if (!blItem) {
    return
  }
  blItem.part = await getPart(db, blItem.partId)
  return blItem
}

export async function getPartByLegoId(db: IDBPDatabase, legoId: string): Promise<Item> {
  let item = await getFromIndex(db, INDICES.PARTS_BY_LEGO_ID, legoId)
  if (!item) {
    item = rbPartsLegoId[legoId]
    if (item) {
      await put(db, STORES.PARTS, item)
    } else {
      console.log('none', item, legoId, Object.keys(rbPartsLegoId))
    }
  }
  return item
}

export async function getCategoryPagePart(db: IDBPDatabase, part: Item): Promise<CategoryPagePart> {
  const p = await getUiPartFromPart(db, part)
  const numInvItems = await getNumInvItemsByPart(db, part)
  return {
    ...p,
    numInvItems
  }
}
export async function getPart(db: IDBPDatabase, partId: IDBValidKey): Promise<Item> {
  return await get(db, STORES.PARTS, partId)
}

export async function getNumParts(db: IDBPDatabase): Promise<number> {
  const parts = await getParts(db)
  return parts.length
}

async function getParts(db: IDBPDatabase): Promise<Item[]> {
  const search = await getActiveSearch()
  const parts: Item[] = await db.getAll(STORES.PARTS.name)
  return parts.filter(part => {
    if (search.categories.excluded.includes(part.categoryId)) {
      return false
    }
    if (search.categories.included.length > 0) {
      if (!search.categories.included.includes(part.categoryId)) {
        return false
      }
    }
    return true
  })
}

export async function getPartPagePart(id: string): Promise<PartPagePart | undefined> {
  const db = await getDbConnection()
  const part: Item = await get(db, STORES.PARTS, id)
  if (!part) {
    return
  }
  const variants: PartPageVariant[] = await getPartPageVariants(db, part.itemId)
  const invItems: PartPageVariantInvItem[] = await getPartPageInvItems(db, part.itemId)
  const brickLinkCategories: BrickLinkCategory[] = await getAllFromIndex(db, INDICES.BRICKLINK_CATEGORIES_BY_CATEGORY, part.categoryId)
  return {
    ...part,
    variants,
    invItems,
    category: await getCategory(db, part.categoryId),
    brickLinkCategories
  }
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
  const items: Item[] = await getParts(db)
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
  // const externalItems = await getPartsPageExternalItems(objectCache, part)
  return {
    ...part,
    variants,
    // externalItems,
  }

}

async function getPartsPageExternalItems(objectCache: ObjectCacheClass, part: Item): Promise<ExternalItem[]> {
  return getAllFromIndex(objectCache.db, INDICES.EXTERNAL_PARTS_BY_PART, part.itemId)
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
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    variant.color = await objectCache.getColor(variant.colorId)
    variant.invItems = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [variant.itemId, variant.colorId]
    )
  }
  const externalParts = await getPartsPageExternalItems(objectCache, part)
  for (let i = 0; i < externalParts.length; i++) {
    const externalPart = externalParts[i]
    if (externalPart.categoryId) {
      externalPart.category = await getExternalCategory(objectCache, externalPart.categoryId, externalPart.type)
    }
  }
  return {
    ...part,
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

export async function getPartsInCategory(db: IDBPDatabase, id: string): Promise<UiItem[]> {
  const search = await getActiveSearch()
  const parts = await getAllFromIndex(db, INDICES.PARTS_BY_CATEGORY, id)
  return parts.filter(part => searchAllowsPart(db, search, part))
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
  categoryId: string,
  colorId: string,
  legoItem: LegoItem,
  item: Item,
  legoName: string,
  newThumb1Img: string,
  db: IDBPDatabase
) {
  legoItem.name = legoName
  await put(db, STORES.PARTS_LEGO, legoItem)
  item.categoryId = categoryId
  await put(db, STORES.PARTS, item)

  let variant: ItemVariant = await getItemVariant(db, item.itemId, colorId)
  if (!variant) {
    const image: string = await toDataURL('https:' + newThumb1Img)
    variant = {
      itemId: item.itemId,
      colorId,
      image
    }
    await put(db, STORES.PART_VARIANTS, variant)
  }
}

export async function getNumPartsInCategory(db: IDBPDatabase, id: number): Promise<number> {
  return await countFromIndex(db, INDICES.PARTS_BY_CATEGORY, id)
}
export async function getNumPartsInBrickLinkCategory(db: IDBPDatabase, category: BrickLinkCategory): Promise<number> {
  const categoryIds = category.categoryIds
  if (!categoryIds) {
    return 0
  }
  let count = 0
  for (let i = 0; i < categoryIds.length; i++) {
    count += await countFromIndex(db, INDICES.PARTS_BY_CATEGORY, categoryIds[i])
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
