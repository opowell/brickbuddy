import { BrickLinkCategory, Cart, CategoriesPageCategory, CategoriesPageExternalCategory, Color, ExternalCategory, ExternalItem, RebrickableItem, Search, SearchFilter, ShopList, Store } from './../types';
import { IDBPDatabase, openDB } from "idb";
import STORES from './stores'
import INDICES from './indices'
import { ActiveSearch, Category, HomeData, Item, ItemVariant, RbColor, StorePageInvItem } from "../types";
import { DB_NAME } from "./constants";

interface Cache {
  carts: Cart[]
  colors: Color[]
  categories: Category[]
  externalCategories: ExternalCategory[]
  externalParts: ExternalItem[]
  lists: ShopList[]
  parts: Item[]
  searches: Search[]
  stores: Store[]
}

const activeSearch = ref<Search | undefined>()
export const objectCache: Ref<Cache> = ref({
  carts: [],
  colors: [],
  categories: [],
  externalCategories: [],
  externalParts: [],
  lists: [],
  parts: [],
  searches: [],
  stores: [],
})

export async function loadActiveSearch() {
  activeSearch.value = await getActiveSearch()
}
export async function loadObjectCache(db: IDBPDatabase) {
  const cache = objectCache.value
  cache.carts.push(...await getAllCarts(db))
  cache.categories.push(...await getAllCategories(db))
  cache.externalCategories.push(...await getAllExternalCategories(db))
  cache.externalCategories.forEach((ec) => {
    ec.category = categoriesMap.value.get(ec.categoryId)
    if (!ec.category) {
      return
    }
    if (!ec.category.externalCategories) {
      ec.category.externalCategories = []
    }
    ec.category.externalCategories.push(ec)
  })
  cache.externalParts.push(...await getAllExternalParts(db))
  cache.colors.push(...await getAllColors(db))
  cache.lists.push(...await getAllLists(db))
  cache.parts.push(...await getAllParts(db))
  cache.searches.push(...await getAllSearches(db))
  cache.stores.push(...await getAllStores(db))
}

function filtersByType(filters: SearchFilter[] | undefined, type: string): SearchFilter[] {
  if (!filters) {
    return []
  }
  return filters.filter(filter => filter.type === type)
}
const filterTypes = [
  'color',
  'condition',
  'store',
  'category',
  'externalCategory'
]
const filters = computed(() => {
  const map = new Map<string, SearchFilter[]>
  filterTypes.forEach((type) => {
    map.set(type, filtersByType(activeSearch.value?.filters, type))
  })
  return map
})
const excludedFilterIds = computed(() => {
  const map = new Map<string, (string | number)[]>
  filterTypes.forEach((type) => {
    const f = filters.value.get(type)
    if (!f) {
      return
    }
    map.set(type, f.filter(f => f.isExcluded).map(f => f.objectId))
  })
  return map
})
const includedFilterIds = computed(() => {
  const map = new Map<string, (string | number)[]>
  filterTypes.forEach((type) => {
    const f = filters.value.get(type)
    if (!f) {
      return
    }
    map.set(type, f.filter(f => !f.isExcluded).map(f => f.objectId))
  })
  return map
})
const activeColors = computed<Color[]>(() => filterObjects<Color>(
  objectCache.value.colors,
  excludedFilterIds.value.get('color'),
  includedFilterIds.value.get('color')
))
const activeStores = computed<Store[]>(() => filterObjects<Store>(
  objectCache.value.stores,
  excludedFilterIds.value.get('store'),
  includedFilterIds.value.get('store')
))
const activeCategories = computed<Category[]>(() => {
  const filtered = filterObjects<Category>(
    objectCache.value.categories,
    excludedFilterIds.value.get('category'),
    includedFilterIds.value.get('category')
  )
  filtered.forEach(c => c.externalCategories = [])
  return filtered
})
const categoriesMap = computed<Map<number, Category>>(() => {
  const map = new Map<number, Category>()
  activeCategories.value.forEach((c) => {
    map.set(c.id, c)
  })
  return map
})
export const externalCategoriesMap = computed<Map<string, ExternalCategory>>(() => {
  const map = new Map<string, ExternalCategory>()
  activeExternalCategories.value.forEach((c) => {
    map.set(c.type + c.id, c)
  })
  return map
})
export const activeExternalCategories = computed<ExternalCategory[]>(() => {
  let filtered: ExternalCategory[] = filterObjects<ExternalCategory>(
    objectCache.value.externalCategories,
    excludedFilterIds.value.get('externalCategory'),
    includedFilterIds.value.get('externalCategory')
  )
  filtered = filterObjects<ExternalCategory>(
    filtered,
    excludedFilterIds.value.get('category'),
    includedFilterIds.value.get('category'),
    (ec: ExternalCategory) => ec.categoryId
  )
  filtered.forEach((ec: ExternalCategory) => {
    ec.image = 'todo'
  })
  return filtered
})
const activeExternalItems = computed<ExternalItem[]>(() => {
  const filtered: ExternalItem[] = filterObjects<ExternalItem>(
    objectCache.value.externalParts,
    excludedFilterIds.value.get('externalCategory'),
    includedFilterIds.value.get('externalCategory'),
    (ei: ExternalItem) => ei.externalCategoryId
  )
  filtered.forEach((ei) => {
    ei.externalCategory = externalCategoriesMap.value.get(ei.type + ei.externalCategoryId)
  })
  return filterObjects<ExternalItem>(
    filtered,
    excludedFilterIds.value.get('category'),
    includedFilterIds.value.get('category'),
    (ei: ExternalItem) => ei.externalCategory?.categoryId
  )
})

export const homeData = computed<HomeData>(() => {
  return {
    stores: activeStores.value.length,
    colors: activeColors.value.length,
    categories: activeCategories.value.length,
    parts: objectCache.value.parts?.length || 0,
    conditions: 2,
    lists: objectCache.value.lists?.length || 0,
    searches: objectCache.value.searches?.length || 0,
    carts: objectCache.value?.carts?.length || 0,
  }
})

const externalCategoriesByCategoryId = computed<Map<number, ExternalCategory[]>>(() => {
  console.log(activeExternalCategories.value.length)
  const map = new Map<number, ExternalCategory[]>()
  activeExternalCategories.value.forEach((ec: ExternalCategory) => {
    const categoryId = ec.categoryId
    let value = map.get(categoryId)
    if (!value) {
      value = []
    }
    value.push(ec)
    map.set(categoryId, value)
  })
  return map
})

const externalPartsInExternalCategory = computed<Map<string, ExternalItem[]>>(() => {
  console.info('externalPartsInExternalCategory', activeExternalItems.value.length)
  const map = new Map<string, ExternalItem[]>
  activeExternalCategories.value.forEach((ec: ExternalCategory) => {
    const id = ec.type + ec.id
    const value: ExternalItem[] = activeExternalItems.value.filter(ei => ei.externalCategoryId === ec.id && ei.type === ec.type)
    map.set(id, value)
  })
  return map
})

// const externalCategoryImages = computed<Map<string, string>>(() => {
//   const map = new Map<string, string>
//   activeExternalCategories.value.forEach((ec: ExternalCategory) => {
//     const id = ec.type + ec.id
//     let value
//     const externalParts = : ExternalItem = await getFromIndex(db, INDICES.EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY, [category.type, category.id])
//     const variants: ItemVariant = 
//       await getFromIndex(db, INDICES.PART_VARIANTS_BY_TYPE_AND_PART, [externalPart.type, externalPart.externalItemId])
//   if (!variant) {
//     return
//   }
//   value = variant.image
//     map.set(id, value)
//   })
//   return map
// })

function getCategoriesPageCategory(category: Category): CategoriesPageCategory | undefined {
  const externalCategories = externalCategoriesByCategoryId.value.get(category.id)
  console.log(externalCategoriesByCategoryId.value, category.id, externalCategories)
  if (!externalCategories) {
    return
  }
  const categoriesPageExternalCategory: CategoriesPageExternalCategory[] = []
  for (let i = 0; i < externalCategories.length; i++) {
    const externalCategory = externalCategories[i]
    const numParts = externalPartsInExternalCategory.value.get(externalCategory.type + externalCategory.id)?.length || 0
    console.log(numParts, externalPartsInExternalCategory.value)
    // const image = externalCategoryImages.value.get(externalCategory.id)
    const image = 'todo'
    if (numParts === 0) {
      continue
    }
    categoriesPageExternalCategory.push({
      ...externalCategory,
      numParts,
      image
    })
  }
  return {
    ...category,
    externalCategories: categoriesPageExternalCategory,
  }
}


export const categories = computed<CategoriesPageCategory[]>(() => {
  const categories = activeCategories.value
  const categoriesPageCategories: CategoriesPageCategory[] = []
  for (let i = 0; i < categories.length; i++) {
    const category: Category = categories[i]
    const categoriesPageCategory: CategoriesPageCategory | undefined = getCategoriesPageCategory(category)
    if (!categoriesPageCategory || categoriesPageCategory.externalCategories.length === 0) {
      continue
    }
    categoriesPageCategories.push(categoriesPageCategory)
  }
  return categoriesPageCategories
    .sort((a, b) => a.id - b.id)
})

function filterObjects<T>(
  objects: T[] | undefined,
  excludedIds: (string | number)[] | undefined,
  includedIds: (string | number)[] | undefined,
  mapFunction: Function = (object: T) => object.id
) {
  if (!objects) {
    return []
  }
  if (!excludedIds || !includedIds) {
    return objects
  }
  const out: T[] = []
  objects.forEach((object) => {
    if (excludedIds.includes(mapFunction(object))) {
      return
    }
    if (includedIds.length && !includedIds.includes(mapFunction(object))) {
      return
    }
    out.push(object)
  })
  return out
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
import { createIndex, createStore, put } from './db';
import { addColor, getAllColors } from './colors';
import { getAllCategories, getAllExternalCategories } from './categories';
import { addShopListDb, getAllLists } from './lists';
import { createInitialStores, getAllStores } from './storeMethods';
import { getAllExternalParts, getAllParts } from './parts';
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
import { getActiveSearch, getAllSearches } from './searches';
import { getAllCarts } from './carts';
let dbConnection: IDBPDatabase | undefined

export async function getObjectCache(): Promise<ObjectCacheClass> {
  // if (!objectCache) {
  //   objectCache = new ObjectCacheClass(await getDbConnection())
  // }
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


