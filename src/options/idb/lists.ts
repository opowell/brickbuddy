import { IDBPDatabase } from "idb"
import { UiShopList, ShopListItem } from "../types"
import { colors } from "./colors"
import { getAllFromIndex } from "./db"
import { getDbConnection } from "./idb"
import STORES from "./stores"
import INDICES from './indices'
import { getPart } from "./parts"

export const lists = ref<UiShopList[]>([])


export async function addNewListItem(item) {
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

export async function addShopList(name: string) {
  const db = await getDbConnection()
  return await addShopListDb(name, db)
}

export async function addShopListDb(name: string, db: IDBPDatabase) {
  const id = await db.put(STORES.LISTS.name, { name })
  if (!id) {
    return
  }
  const list: UiShopList = {
    id: Number(id),
    name,
    items: []
  }
  lists.value.push(list)
}

export async function addShopListItem(
  listId: number,
  itemId: string,
  condition: string,
  minQuantity: number,
  maxQuantity: number,
  maxPrice: number,
  colors: string,
  db: IDBPDatabase
) {
  const shopList = lists.value.find(list => list.id === listId)
  console.log('addShopListItem', shopList, listId)
  if (!shopList) {
    return
  }
  const item: ShopListItem = {
    listId,
    itemId,
    condition,
    minQuantity,
    maxQuantity,
    maxPrice,
    colors: colors.toString().split(',')
  }
  await db.put(STORES.LIST_ITEMS.name, item)
  shopList.items.push(item)
}

async function loadShopListItems(db: IDBPDatabase, listId: string) {
  try {
    const listItems = await getAllFromIndex(
      db,
      INDICES.SHOP_LIST_ITEMS_BY_SHOP_LIST,
      listId
    )
    for (let i = 0; i < listItems.length; i++) {
      const shopListItem = listItems[i]
      shopListItem.item = getPart(db, shopListItem.itemId)
      shopListItem.colorNames = shopListItem.colors.map(colorId => colors.value[colorId])
    }
    return listItems
  } catch (e) {
    console.log('error getting shop list items', e, listId)
  }
  return []
}

export async function loadShopLists() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.LISTS.name)
  for (let i = 0; i < x.length; i++) {
    const list = x[i]
    list.items = await loadShopListItems(db, list.id)
    lists.value.push(list)
  }
}
