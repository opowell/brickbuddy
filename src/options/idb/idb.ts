import { CachedCart, CachedCartItem, CachedCategory, CachedColor, CachedExternalCategory, CachedExternalItem, CachedInvItem, CachedItem, CachedItemVariant, CachedList, CachedSearch, CachedSearchFilter, CachedStore, Cart, CategoriesPageCategory, CategoriesPageExternalCategory, Color, ExternalCategory, ExternalItem, InvItem, RebrickableItem, Search, SearchFilter, ShopList, Store } from './../types';
import { IDBPDatabase, openDB } from "idb";
import STORES from './stores'
import INDICES from './indices'
import { ActiveSearch, HomeData, RbColor } from "../types";
import { DB_NAME } from "./constants";

interface Cache {
  searchFilters: CachedSearchFilter[];
  carts: CachedCart[]
  cartItems: CachedCartItem[]
  colors: CachedColor[]
  categories: CachedCategory[]
  invItems: CachedInvItem[]
  externalCategories: CachedExternalCategory[]
  externalParts: CachedExternalItem[]
  lists: CachedList[]
  parts: CachedItem[]
  searches: CachedSearch[]
  stores: CachedStore[]
  variants: CachedItemVariant[]
}

export const objectCache: Ref<Cache> = ref({
  carts: [],
  cartItems: [],
  colors: [],
  categories: [],
  externalCategories: [],
  externalParts: [],
  invItems: [],
  lists: [],
  parts: [],
  searches: [],
  searchFilters: [],
  stores: [],
  variants: []
})

export async function createActiveSearchIfNecessary(db: IDBPDatabase) {
  if (activeSearch.value) {
    return
  }
  const newSearch: Search = {
    id: 0,
    active: 1,
    name: new Date().toISOString(),
    filters: [],
    priceScoreQuantity: 100,
    priceScoreIgnoreColor: true
  }
  const id = await put(db, STORES.SEARCHES, newSearch)
  if (!id) {
    return
  }
  newSearch.id = id
  objectCache.value.searches.push(newSearch)
}

export const activeCache = computed<Cache>(() => {
  return {
    categories: objectCache.value.categories.filter(c => c.parts.length > 0),
    externalParts: objectCache.value.externalParts.filter(ep => ep.variants.length > 0),
    externalCategories: objectCache.value.externalCategories.filter(ec => ec.externalParts.length > 0),
  }
})

export async function loadObjectCache(db: IDBPDatabase) {
  const cache = objectCache.value
  cache.carts.push(...await getAllCarts(db))
  const categories = await getAllCategories(db)
  cache.categories.push(...categories)
  cache.categories.forEach((c) => {
    c.externalCategories = []
    c.parts = computed(() => {
      // console.log('parts', c, c.externalCategories)
      const parts: CachedExternalItem[] = []
      c.externalCategories.forEach((ec) => {
        parts.push(...ec.externalParts)
      })
      return parts
      // return c.externalCategories.flatMap((ec) => {
      //   return ec.externalParts
      // })
    })
  })
  const externalCategories = await getAllExternalCategories(db)
  externalCategories.forEach((ec) => {
    ec.externalParts = []
  })
  cache.externalCategories.push(...externalCategories)
  cache.externalCategories.forEach((ec) => {
    const category = categoriesMap.value.get(ec.categoryId)
    if (!category) {
      console.log('no category, skipping', ec)
      return
    }
    ec.category = category
    ec.image = computed(() => {
      for (let i = 0; i < ec.externalParts.length; i++) {
        const part = ec.externalParts[i]
        if (!part.image) {
          continue
        }
        return part.image
      }
    })
    // console.log(ec, ec.category, ec.category.externalCategories, ec.category.externalCategories.value)
    ec.category.externalCategories.push(ec)
  })
  const externalParts = await getAllExternalParts(db)
  externalParts.forEach((ep) => {
    ep.variants = []
  })
  cache.externalParts.push(...externalParts)
  cache.externalParts.forEach((ep) => {
    ep.image = computed(() => {
      for (let j = 0; j < ep.variants.length; j++) {
        const variant = ep.variants[j]
        if (variant.image) {
          return variant.image
        }
      }
    })
    const externalCategory = externalCategoriesMap.value.get(ep.type + ep.externalCategoryId)
    if (!externalCategory) {
      return
    }
    ep.externalCategory = externalCategory
    externalCategory.externalParts.push(ep)
  })
  cache.colors.push(...await getAllColors(db))
  cache.lists.push(...await getAllLists(db))
  cache.parts.push(...await getAllParts(db))
  cache.parts.forEach(p => p.externalParts = [])
  cache.externalParts.forEach(ep => {
    const part = partsMap.value.get(ep.itemId)
    if (!part) {
      return
    }
    ep.part = part
    part.externalParts.push(ep)
  })
  cache.searches.push(...await getAllSearches(db))
  cache.searchFilters.push(...await getAllSearchFilters(db))
  cache.searches.forEach(search => {
    search.categories = {
      included: [],
      excluded: []
    }
    search.colors = {
      included: [],
      excluded: []
    }
    search.conditions = {
      included: [],
      excluded: []
    }
    search.stores = {
      included: [],
      excluded: []
    }
    search.parts = {
      included: [],
      excluded: []
    }
  })
  cache.searchFilters.forEach(sf => {
    
  })
  cache.stores.push(...await getAllStores(db))
  cache.stores.forEach(store => {
    store.invItems = []
  })
  cache.invItems.push(...await getAllInvItems(db))
  cache.invItems.forEach(invItem => {
    const store = storesMap.value.get(invItem.type.toString() + invItem.storeId)
    if (!store) {
      return
    }
    store.invItems.push(invItem)
    invItem.store = store
    invItem.item = externalPartsMap.value.get(invItem.type + invItem.itemId)
    invItem.color = colorsMap.value.get(invItem.colorId)
    invItem.priceScore = computed(() => {
      const matchingParts = externalPartsByItemId.value.get(invItem.itemId)
      if (!matchingParts) {
        return ''
      }
      const allMatchingInvItems = new Map<string, InvItem>()
      const search = activeSearch.value
      if (!search) {
        return ''
      }
      for (let i = 0; i < matchingParts.length; i++) {
        const matchingPart = matchingParts[i]
        let matches: InvItem[] | undefined = []
        if (search.priceScoreIgnoreColor) {
          matches = invItemsByItem.value.get(matchingPart.externalItemId)
        } else {
          matches = invItemsByItemColor.value.get(matchingPart.externalItemId + invItem.colorId)
        }
        if (!matches) {
          return ''
        }
        matches.forEach((match) => allMatchingInvItems.set(match.storeId + '//' + match.invId, match))
      }
      return getScore(Array.from(allMatchingInvItems.values()), search.priceScoreQuantity, invItem.price, true)
    })
  })
  cache.variants.push(...await getAllVariants(db))
  cache.variants.forEach((v) => {
    const externalPart = externalPartsMap.value.get(v.type + v.itemId)
    // console.log(v, externalPart)
    if (!externalPart) {
      return
    }
    v.externalPart = externalPart
    v.externalPart.variants.push(v)
  })
  cache.invItems.forEach(invItem => {
    invItem.variant = variantsMap.value.get(invItem.itemId + invItem.colorId)
  })
}

export const activeSearch = computed(() => {
  return objectCache.value.searches.find(s => s.active === 1)
})

export const colorsMap = computed(() => {
  const map = new Map<string, CachedColor>()
  objectCache.value.colors.forEach(c => {
    map.set(c.id, c)
  })
  return map
})
export const partsMap = computed(() => {
  const map = new Map<number, CachedItem>()
  objectCache.value.parts.forEach(p => {
    map.set(p.itemId, p)
  })
  return map
})
export const storesMap = computed(() => {
  const map = new Map<string, CachedStore>()
  objectCache.value.stores.forEach((s) => {
    map.set(s.type.toString() + s.id, s)
  })
  return map
})
const externalPartsByItemId = computed(() => {
  const map = new Map<string, CachedExternalItem[]>()
  objectCache.value.externalParts.forEach((ep) => {
    let value = map.get(ep.externalItemId)
    if (!value) {
      value = []
    }
    value.push(ep)
    map.set(ep.externalItemId, value)
  })
  return map
})
const externalPartsMap = computed(() => {
  const map = new Map<string, CachedExternalItem>()
  objectCache.value.externalParts.forEach((ep) => {
    map.set(ep.type + ep.externalItemId, ep)
  })
  return map
})
const variantsMap = computed(() => {
  const map = new Map<string, CachedItemVariant>()
  objectCache.value.variants.forEach(v => {
    map.set(v.itemId + v.colorId, v)
  })
  return map
})
const invItemsByItemColor = computed(() => {
  const map = new Map<string, CachedInvItem[]>()
  objectCache.value.invItems.forEach(ii => {
    let value = map.get(ii.itemId + ii.colorId)
    if (!value) {
      value = []
    }
    value.push(ii)
    map.set(ii.itemId + ii.colorId, value)
  })
  return map
})
const invItemsByItem = computed(() => {
  const map = new Map<string, CachedInvItem[]>()
  objectCache.value.invItems.forEach(ii => {
    let value = map.get(ii.itemId)
    if (!value) {
      value = []
    }
    value.push(ii)
    map.set(ii.itemId, value)
  })
  return map
})

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
export const activeCategories = computed<CachedCategory[]>(() => {
  const filtered = filterObjects<CachedCategory>(
    objectCache.value.categories,
    excludedFilterIds.value.get('category'),
    includedFilterIds.value.get('category')
  )
  return filtered
})
export const categoriesMap = computed<Map<number, CachedCategory>>(() => {
  const map = new Map<number, CachedCategory>()
  activeCategories.value.forEach((c) => {
    map.set(c.id, c)
  })
  return map
})
export const externalCategoriesMap = computed<Map<string, CachedExternalCategory>>(() => {
  const map = new Map<string, CachedExternalCategory>()
  activeExternalCategories.value.forEach((c) => {
    map.set(c.type + c.id, c)
  })
  return map
})
export const activeExternalCategories = computed<CachedExternalCategory[]>(() => {
  let filtered: CachedExternalCategory[] = filterObjects<CachedExternalCategory>(
    objectCache.value.externalCategories,
    excludedFilterIds.value.get('externalCategory'),
    includedFilterIds.value.get('externalCategory')
  )
  filtered = filterObjects<CachedExternalCategory>(
    filtered,
    excludedFilterIds.value.get('category'),
    includedFilterIds.value.get('category'),
    (ec: CachedExternalCategory) => ec.categoryId
  )
  return filtered
})
const activeExternalItems = computed<CachedExternalItem[]>(() => {
  const filtered: CachedExternalItem[] = filterObjects<CachedExternalItem>(
    objectCache.value.externalParts,
    excludedFilterIds.value.get('externalCategory'),
    includedFilterIds.value.get('externalCategory'),
    (ei: CachedExternalItem) => ei.externalCategoryId
  )
  filtered.forEach((ei) => {
    ei.externalCategory = externalCategoriesMap.value.get(ei.type + ei.externalCategoryId)
  })
  return filterObjects<CachedExternalItem>(
    filtered,
    excludedFilterIds.value.get('category'),
    includedFilterIds.value.get('category'),
    (ei: CachedExternalItem) => ei.externalCategory?.categoryId
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

const externalCategoriesByCategoryId = computed<Map<number, CachedExternalCategory[]>>(() => {
  const map = new Map<number, CachedExternalCategory[]>()
  activeExternalCategories.value.forEach((ec: CachedExternalCategory) => {
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
  const map = new Map<string, ExternalItem[]>
  activeExternalCategories.value.forEach((ec: ExternalCategory) => {
    const id = ec.type + ec.id
    const value: ExternalItem[] = activeExternalItems.value.filter(ei => ei.externalCategoryId === ec.id && ei.type === ec.type)
    map.set(id, value)
  })
  return map
})

export function getCategoriesPageCategory(category: CachedCategory): CategoriesPageCategory | undefined {
  const externalCategories = externalCategoriesByCategoryId.value.get(category.id)
  if (!externalCategories) {
    return
  }
  const categoriesPageExternalCategory: CategoriesPageExternalCategory[] = []
  for (let i = 0; i < externalCategories.length; i++) {
    const externalCategory = externalCategories[i]
    const parts = externalPartsInExternalCategory.value.get(externalCategory.type + externalCategory.id)
    if (!parts || parts.length === 0) {
      continue
    }
    categoriesPageExternalCategory.push({
      ...externalCategory,
      parts,
      image: externalCategory.image
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
    const category: CachedCategory = categories[i]
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
import { createIndex, createStore, getFromIndex, put } from './db';
import { addColor, getAllColors } from './colors';
import { getAllCategories, getAllExternalCategories } from './categories';
import { addShopListDb, getAllLists } from './lists';
import { createInitialStores, getAllInvItems, getAllStores, getAllVariants } from './storeMethods';
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
import { getActiveSearch, getAllSearches, getAllSearchFilters } from './searches';
import { getAllCarts } from './carts';
import { getScore } from '../utils';
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


