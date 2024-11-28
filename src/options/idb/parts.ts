import { IDBPDatabase } from "idb"
import { BrickLinkCategory, BrickLinkItem, CategoryPagePart, Item, ItemVariant, LegoItem, ObjectCache, PartPagePart, PartPageVariant, PartPageVariantInvItem, PartsPagePart, StorePageInvItemItem, UiItem, UiItemVariant, VariantPagePart } from "../types"
import { countFromIndex, get, getAllFromIndex, getFromIndex, put } from "./db"
import STORES from './stores'
import { toDataURL } from "../utils"
import { getItemVariant, getPartPageVariants, getPartsPageVariants, getUiPartVariants } from "./variants"
import { getCategory } from "./categories"
import { colors, getColor } from "./colors"
import { rbPartsBrickLinkId, rbPartsLegoId, getDbConnection } from "./idb"
import INDICES from "./indices"
import { getNumInvItemsByPart, getPartPageInvItems, getVariantInvItems } from "./invItems"
import ObjectCacheClass from "./ObjectCacheClass"
import { getActiveSearch, searchAllowsPart } from "./searches"

export async function addBrickLinkItem(
  categoryId: string,
  colorId: string,
  blItem: BrickLinkItem,
  item: Item,
  brickLinkName: string,
  newThumb1Img: string,
  brickLinkCategoryId: string,
  db: IDBPDatabase
) {
  blItem.name = brickLinkName
  blItem.categoryId = brickLinkCategoryId
  await put(db, STORES.PARTS_BRICK_LINK, blItem)
  item.categoryId = categoryId
  item.brickLinkCategoryId = brickLinkCategoryId
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
  brickLinkId = brickLinkId + ''
  let blItem: BrickLinkItem = await get(db, STORES.PARTS_BRICK_LINK, brickLinkId)
  if (!blItem) {
    const item: Item = rbPartsBrickLinkId[brickLinkId]
    if (item) {
      await storeItem(db, item)
    } else {
      console.log('no item', brickLinkId, item, Object.keys(rbPartsBrickLinkId).includes(brickLinkId))
    }
  }
  blItem = await get(db, STORES.PARTS_BRICK_LINK, brickLinkId)
  if (!blItem) {
    return
  }
  blItem.part = await getPart(db, blItem.partId)
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
export async function getPart(db: IDBPDatabase, partId: string): Promise<Item> {
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
  const objectCache = new ObjectCacheClass(db)
  const items: Item[] = await getParts(db)
  const uiItems: PartsPagePart[] = []
  for (let i = 0; i < items.length; i++) {
    const part = items[i]
    const variants = await getPartsPageVariants(db, part, objectCache)
    if (variants.length === 0) {
      console.log('no variants')
      continue
    }
    uiItems.push({
      ...part,
      variants,
      category: await objectCache.getCategory(part.categoryId)
    })
  }
  return uiItems
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
  const variants: ItemVariant[] = await getAllFromIndex(db, INDICES.PART_VARIANTS_BY_PART, part.itemId + '')
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    variant.color = await objectCache.getColor(variant.colorId)
    variant.invItems = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [variant.itemId, variant.colorId]
    )
  }
  return {
    ...part,
    variants,
    category: await objectCache.getCategory(part.categoryId)
  }
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

export async function getNumPartsInCategory(db: IDBPDatabase, id: string): Promise<number> {
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
