import { objectCache } from './idb';
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

export let liveObjectCache: ObjectCacheClass

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

export const cacheLoaded = ref(false)

export async function loadLiveObjectCache(db: IDBPDatabase) {
  liveObjectCache = new ObjectCacheClass(db)
  cacheLoaded.value = true
}
export async function loadObjectCache(db: IDBPDatabase) {
  startTimer('loadObjectCache')
  startTimer('loadObjectCache1')
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
    ec.category.externalCategories.push(ec)
  })

  const externalParts = await getAllExternalParts(db)
  externalParts.forEach((ep) => {
    ep.variants = []
    ep.invItems = []
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
  reportTime('loadObjectCache1')
  startTimer('loadObjectCache2')
  cache.externalCategories.forEach((ec) => {
    ec.externalPartsFiltered = computed(() => {
      return ec.externalParts.filter(ep => {
        return ep.variants.length > 0
      })
    })
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
  cache.invItems = await getAllInvItems(db)
  reportTime('loadObjectCache2')
  console.log(cache.invItems.length)
  startTimer('loadObjectCache3')
  let i = 0
  cache.invItems.forEach(invItem => {
    if (i === 0) {
      startTimer('loadObjectCache3-2000')
    }
    i++
    if (i === 2000) {
      reportTime('loadObjectCache3-2000')
      i = 0
    }
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
    const externalPart = externalPartsMap.value.get(invItem.type + invItem.itemId)
    if (!externalPart) {
      return
    }
    externalPart.invItems.push(invItem)
    invItem.externalPart = externalPart
  })
  reportTime('loadObjectCache3')
  startTimer('loadObjectCache4')
  cache.variants = await getAllVariants(db)
  cache.variants.forEach((v) => {
    const externalPart = externalPartsMap.value.get(v.type + v.itemId)
    // console.log(v, externalPart)
    if (!externalPart) {
      return
    }
    v.externalPart = externalPart
    v.externalPart.variants.push(v)
    const color = colorsMap.value.get(v.colorId)
    if (!color) {
      return
    }
    v.color = color
  })
  cache.invItems.forEach(invItem => {
    invItem.variant = variantsMap.value.get(invItem.itemId + invItem.colorId)
  })
  cacheLoaded.value = true
  reportTime('loadObjectCache4')
}

export const externalCategoriesPartsFilteredMap = computed<Map<string, CachedExternalItem[]>>(() => {
  startTimer('externalCategoriesPartsFilteredMap')
  const map = new Map<string, CachedExternalItem[]>()
  if (!cacheLoaded) {
    return map
  }
  objectCache.value.externalCategories.forEach(ec => {
    map.set(ec.type + ec.id, ec.externalParts.filter(ep => {
      return ep.variants.length > 0
    }))
  })
  reportTime('externalCategoriesPartsFilteredMap')
  return map
})
export const filteredParts = computed(() => {
  return objectCache.value.parts.filter(p => p.externalParts.length > 0)
})

export const activeSearch = computed<CachedSearch | undefined>(() => {
  return objectCache.value.searches.find(s => s.active === 1)
})

export const colorsMap = computed(() => {
  startTimer('colorsMap')
  const map = new Map<string, CachedColor>()
  objectCache.value.colors.forEach(c => {
    map.set(c.id, c)
  })
  reportTime('colorsMap')
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
  startTimer('storesMap')
  const map = new Map<string, CachedStore>()
  objectCache.value.stores.forEach((s) => {
    map.set(s.type.toString() + s.id, s)
  })
  reportTime('storesMap')
  return map
})
const externalPartsByItemId = computed(() => {
  startTimer('externalPartsByItemId')
  const map = new Map<string, CachedExternalItem[]>()
  objectCache.value.externalParts.forEach((ep) => {
    let value = map.get(ep.externalItemId)
    if (!value) {
      value = []
    }
    value.push(ep)
    map.set(ep.externalItemId, value)
  })
  reportTime('externalPartsByItemId')
  return map
})
const externalPartsMap = computed(() => {
  startTimer('externalPartsMap')
  const map = new Map<string, CachedExternalItem>()
  objectCache.value.externalParts.forEach((ep) => {
    map.set(ep.type + ep.externalItemId, ep)
  })
  reportTime('externalPartsMap')
  return map
})
const variantsMap = computed(() => {
  startTimer('variantsMap')
  const map = new Map<string, CachedItemVariant>()
  objectCache.value.variants.forEach(v => {
    map.set(v.itemId + v.colorId, v)
  })
  reportTime('variantsMap')
  return map
})
const invItemsByItemColor = computed(() => {
  startTimer('invItemsByItemColor')
  const map = new Map<string, CachedInvItem[]>()
  objectCache.value.invItems.forEach(ii => {
    let value = map.get(ii.itemId + ii.colorId)
    if (!value) {
      value = []
    }
    value.push(ii)
    map.set(ii.itemId + ii.colorId, value)
  })
  reportTime('invItemsByItemColor')
  return map
})
const invItemsByItem = computed(() => {
  startTimer('invItemsByItem')
  const map = new Map<string, CachedInvItem[]>()
  objectCache.value.invItems.forEach(ii => {
    let value = map.get(ii.itemId)
    if (!value) {
      value = []
    }
    value.push(ii)
    map.set(ii.itemId, value)
  })
  reportTime('invItemsByItem')
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
  startTimer('activeCategories')
  const filtered = filterObjects<CachedCategory>(
    objectCache.value.categories,
    excludedFilterIds.value.get('category'),
    includedFilterIds.value.get('category')
  )
  reportTime('activeCategories')
  return filtered
})

export const activeCategories2 = computed<CachedCategory[]>(() => {
  startTimer('activeCategories2')
  const x = activeCategories.value.filter(c => {
    return c.externalCategories.some(ec => {
      const filtered = externalCategoriesPartsFilteredMap.value.get(ec.type + ec.id)
      if (!filtered) {
        return false
      }
      return filtered.length > 0
    })
  })
  reportTime('activeCategories2')
  return x
})
export const categoriesMap = computed<Map<number, CachedCategory>>(() => {
  startTimer('categoriesMap')
  const map = new Map<number, CachedCategory>()
  activeCategories.value.forEach((c) => {
    map.set(c.id, c)
  })
  reportTime('categoriesMap')
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
  startTimer('activeExternalCategories')
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
  reportTime('activeExternalCategories')
  return filtered
})
const activeExternalItems = computed<CachedExternalItem[]>(() => {
  startTimer('activeExternalItems')
  const filtered: CachedExternalItem[] = filterObjects<CachedExternalItem>(
    objectCache.value.externalParts,
    excludedFilterIds.value.get('externalCategory'),
    includedFilterIds.value.get('externalCategory'),
    (ei: CachedExternalItem) => ei.externalCategoryId
  )
  filtered.forEach((ei) => {
    ei.externalCategory = externalCategoriesMap.value.get(ei.type + ei.externalCategoryId)
  })
  const x = filterObjects<CachedExternalItem>(
    filtered,
    excludedFilterIds.value.get('category'),
    includedFilterIds.value.get('category'),
    (ei: CachedExternalItem) => ei.externalCategory?.categoryId
  )
  reportTime('activeExternalItems')
  return x
})

export const homeData = computed<HomeData>(() => {
  return {
    stores: activeStores.value.length,
    colors: activeColors.value.length,
    categories: activeCategories2.value.length,
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

export async function getCategoriesPageCategory(category: CachedCategory, objectCache: ObjectCacheClass): Promise<CategoriesPageCategory | undefined> {
  const externalCategories = await objectCache.getExternalCategoriesByCategoryId(category.id)
  if (!externalCategories) {
    return
  }
  const categoriesPageExternalCategory: CategoriesPageExternalCategory[] = []
  for (let i = 0; i < externalCategories.length; i++) {
    const externalCategory = externalCategories[i]
    const parts = await objectCache.getExternalPartsInExternalCategory(externalCategory.type, externalCategory.id)
    if (!parts || parts.length === 0) {
      continue
    }
    categoriesPageExternalCategory.push({
      ...externalCategory,
      parts,
      externalPartsFiltered: parts,
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
    if (categoriesPageCategory.externalCategories.every(ec => {
      if (!ec.externalPartsFiltered) {
        return true
      }
      return ec.externalPartsFiltered.length === 0
    })) {
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

async function importBrickLinkStores(db: IDBPDatabase) {
  const pages = [
    '0-9', 'A', 'B', 'C', 'D', 'E',
    'F', 'G', 'H', 'I', 'J', 'K',
    'L', 'M', 'N', 'O', 'P', 'Q',
    'R', 'S', 'T', 'U', 'V', 'W',
    'X', 'Y', 'Z'
  ]
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const response = await fetch("https://www.bricklink.com/browseStores.asp?wordLetter=" + page, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en,de;q=0.9,es;q=0.8,en-US;q=0.7",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    })
    const html = await response.text()
    let index = 0
    const stores = []
    while (index !== -1) {
      const nextIndex = html.indexOf('<a href="store.asp?p=')
      const startOfSlug = nextIndex + '<a href="store.asp?p='.length
      const endOfSlug = html.indexOf('"', startOfSlug)
      const startOfName = endOfSlug + '">'.length
      const endOfName = html.indexOf(' </a>', startOfName)
      const slug = html.substring(startOfSlug, endOfSlug)
      const name = html.substring(startOfName, endOfName)
      const storePage = await fetch("https://store.bricklink.com/" + slug, {
        "headers": {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en,de;q=0.9,es;q=0.8,en-US;q=0.7",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "priority": "u=0, i",
          "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1"
        },
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      })
      const storeHtml = await storePage.text()
      const startProps = storeHtml.indexOf('StoreFront.store = ') + 'StoreFront.store = '.length
      const endProps = storeHtml.indexOf(';', startProps)
      const props = JSON.parse(storeHtml.substring(startProps, endProps))
      // await addStore(name, id, [], slug, 100, db)
    }
  }
}
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
import { addStore, createInitialStores, getAllInvItems, getAllStores, getAllVariants } from './storeMethods';
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
  // await importBrickLinkStores(db)
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
  startTimer('importRbPartsToMemory')
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
  reportTime('importRbPartsToMemory')
}

import ObjectCacheClass from './ObjectCacheClass'
import { getActiveSearch, getAllSearches, getAllSearchFilters } from './searches';
import { getAllCarts } from './carts';
import { getScore, reportTime, startTimer } from '../utils';
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


