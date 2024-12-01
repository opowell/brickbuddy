import { IDBPDatabase } from "idb"
import { get, getAllFromIndex, getFromIndex, put } from "./db"
import { Color, ColorPageColor, ColorPageInvItem, ColorsPageColor, InvItem, ItemVariant, Store, StoreType, UiColor } from "../types"
import STORES from './stores'
import INDICES from './indices'
import { getDbConnection } from "./idb"
import { countInvItemsWithColor, getInvItemsWithColor } from "./invItems"
import { getPart } from "./parts"
import { getItemVariant } from "./variants"
import { getStore } from "./storeMethods"
export const colors = ref({})

export async function getUiColor(id: string): Promise<ColorPageColor> {
  const db = await getDbConnection()
  const color: Color = await get(db, STORES.COLORS, id)
  const invItems = await getInvItemsWithColor(db, id)
  const uiColor: ColorPageColor = {
    ...color,
    invItems
  }
  return uiColor
}
export async function getColorPageColor(id: string): Promise<ColorPageColor> {
  id = id + ''
  const db = await getDbConnection()
  const color: Color = await get(db, STORES.COLORS, id)
  const invItems: InvItem[] = await getAllFromIndex(db, INDICES.INV_ITEMS_BY_COLORS, id)
  const colorPageInvItems: ColorPageInvItem[] = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem = invItems[i]
    const part = await getPart(db, invItem.itemId)
    const color = await getColor(db, invItem.colorId)
    const store: Store = await getStore(db, invItem.storeId)
    const type = store.type === StoreType.BrickLink ? 'BrickLink' : 'Lego'
    const variant: ItemVariant = await getItemVariant(db, type, invItem.itemId, id)
    colorPageInvItems.push({
      ...invItem,
      item: part,
      colorName: color.name,
      variant,
      store
    })
  }
  const uiColor: ColorPageColor = {
    ...color,
    invItems: colorPageInvItems
  }
  return uiColor
}
export async function getColorsPageColors(): Promise<ColorsPageColor[]> {
  const db = await getDbConnection()
  const colors: Color[] = await db.getAll(STORES.COLORS.name)
  const uiColors: ColorsPageColor[] = []
  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    const numInvItems = await countInvItemsWithColor(db, color.id)
    // if (numInvItems === 0) {
    //   continue
    // }
    const invItem: ItemVariant = await getFromIndex(db, INDICES.PART_VARIANTS_BY_COLOR, color.id)
    const image = invItem?.image
    uiColors.push({
      ...color,
      numInvItems,
      image
    })
  }
  return uiColors
}

export async function addColor(
  db: IDBPDatabase,
  id: string,
  name: string,
  brickLinkId?: string,
  brickLinkName?: string,
  legoId?: string,
  legoName?: string
) {
  const color: Color = {
    id,
    name,
    brickLinkId,
    brickLinkName,
    legoId,
    legoName
  }
  await put(db, STORES.COLORS, color)
}

export async function getColor(db: IDBPDatabase, colorId: string): Promise<Color> {
  return await get(db, STORES.COLORS, colorId)
}
