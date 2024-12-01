import { IDBPDatabase } from "idb"
import { UiItemVariant, ItemVariant, InvItem, UiInvItem, UiItem, Color, VariantPageVariant, VariantPageInvItem, VariantPagePart, ObjectCache, PartPageVariant, Item, PartsPageVariant } from "../types"
import { getCartQuantity } from "./carts"
import { getColor, colors } from "./colors"
import { get, getAllFromIndex } from "./db"
import { getDbConnection } from "./idb"
import INDICES from "./indices"
import { getPartPageVariantInvItems, getPartsPageVariantInvItems } from "./invItems"
import ObjectCacheClass from "./ObjectCacheClass"
import { getUiPart, getVariantPagePart } from "./parts"
import { getActiveCart } from "./searches"
import STORES from './stores'
import { addShopListItem } from "./lists"

export async function getItemVariant(
  db: IDBPDatabase,
  type: 'Rebrickable' | 'Lego' | 'BrickLink',
  externalItemId: string,
  colorId: string
) {
  if (!externalItemId || !colorId) {
    console.log('no item variant', externalItemId, colorId)
    return
  }
  return await get(db, STORES.PART_VARIANTS, [type, externalItemId, colorId])
}

export async function getUiPartVariant(partId: string, colorId: string): Promise<UiItemVariant> {
  const db = await getDbConnection()
  const variant: ItemVariant = await get(db, STORES.PART_VARIANTS, [partId, colorId])
  const invItems: InvItem[] = await getAllFromIndex(
    db,
    INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
    [variant.itemId, variant.colorId]
  )
  console.log(partId, colorId, invItems)
  const uiInvItems: UiInvItem[] = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem: InvItem = invItems[i]
    const store = await get(db, STORES.STORES, invItem.storeId)
    const uiItem: UiItem | undefined = await getUiPart(invItem.itemId)
    const color: Color | undefined = await getColor(db, invItem.colorId)
    if (!uiItem || !color) {
      continue
    }
    uiInvItems.push({
      ...invItem,
      store,
      item: uiItem,
      colorName: color.name
    })
  }
  const uiPartVariant: UiItemVariant = {
    ...variant,
    color: await getColor(db, variant.colorId + ''),
    invItems: uiInvItems,
    item: await getUiPart(variant.itemId),
  }
  return uiPartVariant
}
export async function getVariantPageVariant(partId: string, colorId: string): Promise<VariantPageVariant> {
  const db = await getDbConnection()
  const activeCart = await getActiveCart()
  const variant: ItemVariant = await get(db, STORES.PART_VARIANTS, [partId, colorId])
  const invItems: InvItem[] = await getAllFromIndex(
    db,
    INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
    [variant.itemId, variant.colorId]
  )
  const uiInvItems: VariantPageInvItem[] = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem: InvItem = invItems[i]
    const store = await get(db, STORES.STORES, invItem.storeId)
    const uiItem: VariantPagePart | undefined = await getVariantPagePart(invItem.itemId)
    const color: Color | undefined = await getColor(db, invItem.colorId)
    if (!uiItem || !color) {
      continue
    }
    const cartQuantity = getCartQuantity(activeCart, invItem)
    uiInvItems.push({
      ...invItem,
      store,
      item: uiItem,
      cartQuantity
    })
  }
  const uiPartVariant: VariantPageVariant = {
    ...variant,
    color: await getColor(db, variant.colorId + ''),
    invItems: uiInvItems,
    item: await getUiPart(variant.itemId),
  }
  return uiPartVariant
}
export async function getUiPartVariants(db: IDBPDatabase, id: string, objectCache?: ObjectCache): Promise<UiItemVariant[]> {
  const variants: UiItemVariant[] = await getAllFromIndex(db, INDICES.PART_VARIANTS_BY_PART, id)
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    variant.color = colors.value[variant.colorId]
    variant.invItems = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [variant.itemId, variant.colorId]
    )
  }
  return variants
}
export async function getPartPageVariants(db: IDBPDatabase, id: number, objectCache?: ObjectCache): Promise<PartPageVariant[]> {
  const variants: ItemVariant[] = await getAllFromIndex(db, INDICES.PART_VARIANTS_BY_PART, id)
  const partPageVariants: PartPageVariant[] = []
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    const partPageVariant = {
      ...variant,
      color: await getColor(db, variant.colorId),
      invItems: await getPartPageVariantInvItems(db, variant)
    }
    partPageVariants.push(partPageVariant)
  }
  return partPageVariants
}

export async function getPartsPageVariants(db: IDBPDatabase, item: Item, objectCache?: ObjectCacheClass): Promise<PartsPageVariant[]> {
  if (!objectCache) {
    objectCache = new ObjectCacheClass(db)
  }
  try {
    const variants: ItemVariant[] = await getAllFromIndex(
      db,
      INDICES.PART_VARIANTS_BY_PART,
      item.itemId
    )
    const partsPageVariants: PartsPageVariant[] = []
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      const invItems = await getPartsPageVariantInvItems(db, variant, objectCache)
      if (invItems.length === 0) {
        continue
      }
      partsPageVariants.push({
        ...variant,
        item,
        color: await objectCache.getColor(variant.colorId),
        invItems
      })
    }
    return partsPageVariants
  } catch (e) {
    console.log('error getting store items', e, item.itemId)
  }
  return []
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

