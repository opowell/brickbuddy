import { IDBPDatabase } from 'idb'
import { UiShopList, ShopListItem, ShopList, CachedList } from '../types'
import { colors } from './colors'
import { getAll, getAllFromIndex } from './db'
import { getDbConnection } from './idb'
import STORES from './stores'
import INDICES from './indices'
import { getPart } from './parts'

export async function addShopList(name: string) {
  const db = await getDbConnection()
  return await addShopListDb(name, db)
}

export async function addShopListDb(name: string, db: IDBPDatabase) {
  await db.put(STORES.LISTS.name, { name })
}

export async function getAllLists(db: IDBPDatabase): Promise<CachedList[]> {
  return await getAll(db, STORES.LISTS)
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
  console.log('addShopListItem', listId)
  const item: ShopListItem = {
    listId,
    itemId,
    condition,
    minQuantity,
    maxQuantity,
    maxPrice,
    colors: colors.toString().split(','),
  }
  await db.put(STORES.LIST_ITEMS.name, item)
}
