import { IDBPDatabase } from "idb"
import { UiItemVariant, ItemVariant, InvItem, UiInvItem, UiItem, Color, VariantPageVariant, VariantPageInvItem, VariantPagePart, ObjectCache, PartPageVariant, Item, PartsPageVariant, ExternalItem, CachedExternalItem, CachedItemVariant } from "../types"
import { getCartQuantity } from "./carts"
import { getColor, colors } from "./colors"
import { get, getAllFromIndex } from "./db"
import { cacheLoaded, getDbConnection, liveObjectCache } from "./idb"
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
    variant.color = await getColor(db, variant.colorId)
    variant.invItems = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [variant.itemId, variant.colorId]
    )
  }
  return variants
}
export async function getPartPageVariants(id: number): Promise<PartPageVariant[] | undefined> {
  const partPageVariants: PartPageVariant[] = []
  const externalItems = await liveObjectCache.getExternalPartsByPart(id)
  if (!externalItems) {
    return
  }
  for (let j = 0; j < externalItems.length; j++) {
    const externalItem = externalItems[j]    
    const variants = await liveObjectCache.getVariantsByExternalPart(externalItem.externalItemId, externalItem.type)
    if (!variants) {
      continue
    }
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      const partPageVariant = {
        ...variant,
        color: await liveObjectCache.getColor(variant.colorId),
        invItems: await getPartPageVariantInvItems(variant)
      }
      partPageVariants.push(partPageVariant)
    }
  }
  return partPageVariants
}

export const getExternalPartsByPart = computed<Map<number, CachedExternalItem[]>>(() => {
  const map = new Map<number, CachedExternalItem[]>()
  objectCache.value.externalParts.forEach(ep => {
    let value = map.get(ep.itemId)
    if (!value) {
      value = []
    }
    value.push(ep)
    map.set(ep.itemId, value)
  })
  return map
})
export const getPartsPageVariants = computed<Map<number, PartsPageVariant[]>>(() => {
  const parts = objectCache.value.parts
  const map = new Map<number, PartsPageVariant[]>()
  parts.forEach(item => {
    const externalParts = item.externalParts
    if (!externalParts) {
      return
    }
    const partsPageVariants: PartsPageVariant[] = []
    for (let i = 0; i < externalParts.length; i++) {
      const externalPart = externalParts[i]
      const variants = variantsByTypePart.value.get(externalPart.type + externalPart.externalItemId)
      if (!variants) {
        continue
      }
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i]
        const invItems = getPartsPageVariantInvItems.value.get(variant.itemId + variant.colorId)
        if (!invItems || invItems.length === 0) {
          continue
        }
        const color = colorsMap.value.get(variant.colorId)
        if (!color) {
          continue
        }
        partsPageVariants.push({
          ...variant,
          item: externalPart,
          color,
          invItems
        })
      }
    }
    map.set(item.itemId, partsPageVariants)
  })
  return map
})

const variantsByTypePart = computed<Map<string, CachedItemVariant[]>>(() => {
  const map = new Map<string, CachedItemVariant[]>()
  objectCache.value.variants.forEach(v => {
    let value = map.get(v.type + v.itemId)
    if (!value) {
      value = []
    }
    value.push(v)
    map.set(v.type + v.itemId, value)
  })
  return map
})

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

