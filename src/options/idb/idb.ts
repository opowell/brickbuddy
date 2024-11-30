import { BrickLinkCategoriesPageCategory, BrickLinkCategory, ExternalCategory, ExternalItem, RebrickableItem } from './../types';
import { IDBPDatabase, openDB } from "idb";
import STORES from './stores'
import INDICES from './indices'
import { ActiveSearch, Category, HomeData, Item, ItemVariant, RbColor, StorePageInvItem } from "../types";
import { DB_NAME } from "./constants";

export async function getHomeData(): Promise<HomeData> {
  const db = await getDbConnection()
  return {
    stores: await count(db, STORES.STORES),
    colors: await count(db, STORES.COLORS),
    categories: await getCategoriesCount(db),
    parts: await getNumParts(db),
    conditions: 2,
    lists: await count(db, STORES.LISTS),
    searches: await count(db, STORES.SEARCHES),
    carts: await count(db, STORES.CARTS),
  }
}
function partExcluded(part: Item, search: ActiveSearch) {
  const categories = search.categories
  if (categories.excluded.length) {
    if (categories.excluded.includes(part.categoryId)) {
      return true
    }
  }
  if (
    categories.included.length > 0 &&
    !categories.included.includes(part.categoryId)
  ) {
    return true
  }   
  return false
}
export async function getBrickLinkCategoryImage(db: IDBPDatabase, category: BrickLinkCategory): Promise<string | undefined> {
  const categoryIds = category.categoryIds
  if (!categoryIds) {
    return
  }
  for (let i = 0; i < categoryIds.length; i++) {
    const id = categoryIds[i]
    const part: Item = await getFromIndex(db, INDICES.PARTS_BY_CATEGORY, id)
    if (!part) {
      continue
    }
    const variant: ItemVariant = await getFromIndex(db, INDICES.PART_VARIANTS_BY_PART, part.itemId)
    if (!variant) {
      continue
    }
    return variant.image
  }
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
    const categoryId = await putCategory(db, {})
    if (!categoryId) {
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

async function putCategory(db: IDBPDatabase, category: Category) {
  return await put(db, STORES.CATEGORIES, category)
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
export const rbPartsLegoId: Map<string, RebrickableItem> = new Map<string, RebrickableItem>()
export const rbPartsBrickLinkId: Map<string, RebrickableItem> = new Map<string, RebrickableItem>()
export async function importRbPartsToMemory() {
  for (let i = 0; i < rbParts.length; i++) {
    const rbPart = rbParts[i]
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
      categoryId: rbPart.part_cat_id,
      name: rbPart.name,
      legoPartIds,
      brickLinkIds,
      type: 'Rebrickable',
      itemId: ''
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


// import rbParts from '../rbPartMappings.json'
// async function importParts(db: IDBPDatabase) {
//   for (let i = 0; i < rbParts.length; i++) {
//     const rbPart = rbParts[i]
//     const itemId = await db.put(STORES.PARTS.name, rbPart)
//     rbPart.external_ids?.LEGO?.forEach(async (legoPartId: string) => {
//       await putExternalItem(db, {
//         itemId,
//         externalItemId: legoPartId,
//         type: 'Lego'
//       })
//     })
//     rbPart.external_ids?.BrickLink?.forEach(async (brickLinkId: string) => {
//       await putExternalItem(db, {
//         itemId,
//         externalItemId: brickLinkId,
//         type: 'BrickLink'
//       })
//     })
//   }
// }

// async function putExternalItem(db: IDBPDatabase, externalItem: ExternalItem) {
//   return put(db, STORES.EXTERNAL_PARTS, externalItem)
// }


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
            createStore(db, STORES[key])
          })
          Object.keys(INDICES).forEach((key) => {
            createIndex(transaction, INDICES[key])
          })
          createData = true
          break
        }
        // case 1:
        //   db.createObjectStore(STORES.CATEGORIES_BRICKLINK.name, {
        //     keyPath: STORES.CATEGORIES_BRICKLINK.keyPath
        //   })
        //   break
        // case 2: {
        //   createIndex(transaction, INDICES.BRICKLINK_CATEGORIES_BY_CATEGORY)
        // }
        // case 3: {
        //   db.createObjectStore(STORES.CART_ITEMS.name, {
        //     keyPath: STORES.CART_ITEMS.keyPath
        //   })
        //   createIndex(transaction, INDICES.CART_ITEMS_BY_CART)
        // }
        // case 4: {
        //   createIndex(transaction, INDICES.CARTS_BY_ACTIVE)
        // }
        // case 5: {
        //   createIndex(transaction, INDICES.SEARCHES_BY_ACTIVE)
        // }
        // case 6: {
        //   createStore(db, STORES.SEARCH_FILTERS)
        // }
      }
    }
  })
  if (createData) {
    await createInitialData(db)
  }
  dbConnection = db
  return db
}


