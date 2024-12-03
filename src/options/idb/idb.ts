import { BrickLinkCategory, ExternalCategory, RebrickableItem } from './../types';
import { IDBPDatabase, openDB } from "idb";
import STORES from './stores'
import INDICES from './indices'
import { ActiveSearch, Category, HomeData, Item, ItemVariant, RbColor, StorePageInvItem } from "../types";
import { DB_NAME } from "./constants";

export async function getHomeData(): Promise<HomeData> {
  console.log('getHomeData')
  const db = await getDbConnection()
  const objectCache = new ObjectCacheClass(db)
  console.log(await count(db, STORES.STORES))
  console.log(await count(db, STORES.COLORS))
    console.log(await getCategoriesCount(db))
    console.log(await getNumParts(objectCache))
    console.log(2)
    console.log(await count(db, STORES.LISTS))
    console.log(await count(db, STORES.SEARCHES))
    console.log(await count(db, STORES.CARTS))

  return {
    stores: await count(db, STORES.STORES),
    colors: await count(db, STORES.COLORS),
    categories: await getCategoriesCount(db),
    parts: await getNumParts(objectCache),
    conditions: 2,
    lists: await count(db, STORES.LISTS),
    searches: await count(db, STORES.SEARCHES),
    carts: await count(db, STORES.CARTS),
  }
}
function isCategoryExcluded(categoryId: number, search: ActiveSearch) {
  const categories = search.categories
  if (categories.excluded.length) {
    if (categories.excluded.includes(categoryId)) {
      return true
    }
  }
  if (
    categories.included.length > 0 &&
    !categories.included.includes(categoryId)
  ) {
    return true
  }   
  return false
}
export async function getDbCreateInitialStores() {
  const db = await getDbConnection()
  return await createInitialStores(db)
}
import rbColors from '../rebrickable-colors.json'
async function createInitialColors(db: IDBPDatabase) {
  for (let i = 0; i < rbColors.length; i++) {
    const rbColor: RbColor = rbColors[i]
    try {
      let blId, blName, legoId, legoName
      if (rbColor.BrickLink !== '') {
        const variant = rbColor.BrickLink.split('\n')[0].trim()
        const [first, ...rest] = variant.split(' ')
        blId = first
        blName = JSON.parse(rest.join(' ').replaceAll('\'', '"').trim())[0]
      }
      if (rbColor.LEGO !== '') {
        const variant = rbColor.LEGO.split('\n')[0].trim()
        const [first, ...rest] = variant.split(' ')
        legoId = first
        legoName = JSON.parse(rest.join(' ').replaceAll('\'', '"').trim())[0]
      }
      await addColor(db, rbColor.ID.toString(), rbColor.Name, blId, blName, legoId, legoName)
    } catch (e) {
      console.log(e)
    }
  }
}

import rbCategories from '../rbCategories.json'
import { count, countFromIndex, createIndex, createStore, getFromIndex, put } from './db';
import { addColor } from './colors';
import { getCategoriesCount } from './categories';
import { addShopListDb } from './lists';
import { createInitialStores } from './storeMethods';
import { getNumParts } from './parts';
async function importRbCategories(db: IDBPDatabase) {
  for (let i = 0; i < rbCategories.length; i++) {
    const rbCategory = rbCategories[i]
    const categoryId = await putCategory(db)
    if (!categoryId || typeof categoryId !== 'number') {
      return
    }
    await putExternalCategory(db, {
      categoryId,
      type: 'Rebrickable',
      id: rbCategory.id + '',
      name: rbCategory.name
    })
  }
}

async function putExternalCategory(db: IDBPDatabase, externalCategory: ExternalCategory) {
  return await put(db, STORES.EXTERNAL_CATEGORIES, externalCategory)
}

async function putCategory(db: IDBPDatabase) {
  return await put(db, STORES.CATEGORIES, {})
}

async function createInitialData(db: IDBPDatabase) {
  console.log('createInitialData')
  await importRbCategories(db)
  // await importParts(db)
  await createInitialColors(db)  
  await createInitialStores(db)  
  await addShopListDb("Board games 2024", db)
}

import rbParts from '../rbPartMappings.json'
interface RbPart {
  part_cat_id: number;
  name: string;
  part_num: string;
  external_ids: {
    BrickLink: string[];
    LEGO: string[]
  }
}
export const rbPartsLegoId: Map<string, RebrickableItem> = new Map<string, RebrickableItem>()
export const rbPartsBrickLinkId: Map<string, RebrickableItem> = new Map<string, RebrickableItem>()
export async function importRbPartsToMemory() {
  // @ts-ignore
  const rbArray: RbPart[] = rbParts
  for (let i = 0; i < rbArray.length; i++) {
    const rbPart = rbArray[i]
    let legoPartIds: string[] | undefined
    if (rbPart.external_ids.LEGO) {
      legoPartIds = rbPart.external_ids.LEGO
    }
    let brickLinkIds: string[] | undefined
    if (rbPart.external_ids.BrickLink) {
      brickLinkIds = rbPart.external_ids.BrickLink
    }
    const part: RebrickableItem = {
      externalItemId: rbPart.part_num,
      externalCategoryId: rbPart.part_cat_id + '',
      name: rbPart.name,
      legoPartIds,
      brickLinkIds,
      type: 'Rebrickable',
      itemId: -1
    }
    if (legoPartIds) {
      legoPartIds.forEach(legoPartId => {
        rbPartsLegoId.set(legoPartId, part)
      })
    }
    if (brickLinkIds) {
      brickLinkIds.forEach(brickLinkId => {
        rbPartsBrickLinkId.set(brickLinkId, part)
      })
    }
  }
}

import ObjectCacheClass from './ObjectCacheClass'
let dbConnection: IDBPDatabase | undefined
let objectCache: ObjectCacheClass | undefined

export async function getObjectCache(): Promise<ObjectCacheClass> {
  if (!objectCache) {
    objectCache = new ObjectCacheClass(await getDbConnection())
  }
  return objectCache
}

export async function getDbConnection(): Promise<IDBPDatabase> {
  if (dbConnection) {
    return dbConnection
  }
  let createData = false
  const db = await openDB(DB_NAME, 1, {
    async upgrade(db, oldVersion, newVersion, transaction) {
      switch (oldVersion) {
        case 0: {
          Object.keys(STORES).forEach((key) => {
            // @ts-ignore
            createStore(db, STORES[key])
          })
          Object.keys(INDICES).forEach((key) => {
            // @ts-ignore
            createIndex(transaction, INDICES[key])
          })
          createData = true
          break
        }
      }
    }
  })
  if (createData) {
    await createInitialData(db)
  }
  dbConnection = db
  return db
}


