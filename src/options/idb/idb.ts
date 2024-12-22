import { BrickLinkStorePage, CachedExternalCategory, CategoriesPageCategory, CategoriesPageExternalCategory, Category, ExternalCategory, RebrickableItem, Search, SearchFilter, Store, StoreType } from './../types';
import { IDBPDatabase, openDB } from "idb";
import STORES from './stores'
import INDICES from './indices'
import { RbColor } from "../types";
import { DB_NAME } from "./constants";
import ObjectCacheClass from './ObjectCacheClass'

export let liveObjectCache: ObjectCacheClass
export async function createActiveSearchIfNecessary(objectCache: ObjectCacheClass) {
  const activeSearch = await objectCache.getActiveSearch()
  if (activeSearch) {
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
  const id = await put(objectCache.db, STORES.SEARCHES, newSearch)
  if (!id) {
    return
  }
  newSearch.id = id
}

export const cacheLoaded = ref(false)

export async function loadLiveObjectCache(db: IDBPDatabase) {
  liveObjectCache = new ObjectCacheClass(db)
  cacheLoaded.value = true
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
export const externalCategoriesMap = computed<Map<string, CachedExternalCategory>>(() => {
  const map = new Map<string, CachedExternalCategory>()
  activeExternalCategories.value.forEach((c) => {
    map.set(c.type + c.id, c)
  })
  return map
})

export async function getCategoriesPageCategory(category: Category): Promise<CategoriesPageCategory | undefined> {
  const externalCategories = await liveObjectCache.getExternalCategoriesByCategoryId(category.id)
  if (!externalCategories) {
    return
  }
  const categoriesPageExternalCategory: CategoriesPageExternalCategory[] = []
  for (let i = 0; i < externalCategories.length; i++) {
    const externalCategory = externalCategories[i]
    const parts = await liveObjectCache.getExternalPartsInExternalCategory(externalCategory.type, externalCategory.id)
    if (!parts || parts.length === 0) {
      continue
    }
    const variant = await liveObjectCache.getFirstVariantByPart(parts[0].externalItemId)
    categoriesPageExternalCategory.push({
      ...externalCategory,
      parts,
      image: variant?.image
    })
  }
  return {
    ...category,
    externalCategories: categoriesPageExternalCategory,
  }
}

export async function getDbCreateInitialStores() {
  const db = await getDbConnection()
  return await createInitialStores(db)
}
import rbColors from '../rebrickable-colors.json'

async function getBrickLinkStorePage(db: IDBPDatabase): Promise<BrickLinkStorePage | undefined> {
  const yearsAgo = new Date()
  const yearsAhead = new Date()
  yearsAgo.setFullYear(yearsAgo.getFullYear() - 100)
  yearsAhead.setFullYear(yearsAhead.getFullYear() + 100)
  return getFromIndex<BrickLinkStorePage>(
    db,
    INDICES.BRICK_LINK_STORE_PAGES_BY_NEXT_SCRAPE,
    IDBKeyRange.bound([yearsAgo], [yearsAhead])
  )
}
export async function importBrickLinkStores(db: IDBPDatabase) {
  let page = await getBrickLinkStorePage(db)
  if (!page) {
    const oneYearAhead = new Date()
    oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1)
    page = {
      url: "https://www.bricklink.com/browse.asp",
      nextScrape: oneYearAhead,
      scrapeMultiplier: 1
    }
    await addBrickLinkStorePage(db, page)
  }
  let score = await fetchBrickLinkPage(page.url, db)
  if (score > 0) {
    score *= page.scrapeMultiplier
  } else {
    score /= page.scrapeMultiplier
  }
  addMinutes(page.nextScrape, -score)
  page.scrapeMultiplier = score > 0 ? (page.scrapeMultiplier * 2) : (page.scrapeMultiplier / 2) 
  page.scrapeMultiplier = Math.max(0.00001, page.scrapeMultiplier)
  page.scrapeMultiplier = Math.min(100000, page.scrapeMultiplier)
  await updateBrickLinkStorePage(db, page)
}

async function addBrickLinkStorePage(db: IDBPDatabase, page: BrickLinkStorePage) {
  if (await get(db, STORES.BRICK_LINK_STORE_PAGES, page.url)) {
    return
  }
  console.log('addBrickLinkStorePage', page.url)
  return await updateBrickLinkStorePage(db, page)
}
async function updateBrickLinkStorePage(db: IDBPDatabase, page: BrickLinkStorePage) {
  return await put(db, STORES.BRICK_LINK_STORE_PAGES, page)
}

async function fetchBrickLinkPage(url: string, db: IDBPDatabase) {
  const response = await fetch(url, {
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
  let html = await response.text()
  const storeScore = await parseStoreLinks(html, db)
  const linksScore = await parsePageLinks(html, db)
  return storeScore + linksScore
}

async function parseStoreLinks(html: string, db: IDBPDatabase): Promise<number> {
  console.log('parseStoreLinks')
  let score = 0
  const INSTANT_CHECKOUT = ' <a href="https://www.bricklink.com/help.asp?helpID=2466"><I class="fas fa-bolt icon-instant-checkout"></I></a>'
  html = html.replaceAll(INSTANT_CHECKOUT, '')
  html = html.replaceAll('</a>', '</A>')
  const SLUG_START = 'store.asp?p='
  const SLUG_END = '\'>'
  const NAME_END = '</A>'
  let nextIndex = html.indexOf(SLUG_START)
  while (nextIndex !== -1) {
    const startOfSlug = nextIndex + SLUG_START.length
    const endOfSlug = html.indexOf(SLUG_END, startOfSlug)
    const startOfName = endOfSlug + SLUG_END.length
    const endOfName = html.indexOf(NAME_END, startOfName)
    const slug = html.substring(startOfSlug, endOfSlug)
    const name = html.substring(startOfName, endOfName)
    if (
      startOfSlug === -1 ||
      endOfSlug === -1 ||
      startOfName === -1 ||
      endOfName === -1
    ) {
      break
    }
    nextIndex = html.indexOf(SLUG_START, endOfName)
    const added = await importBrickLinkStore(db, slug, name)
    if (added) {
      score++
    }
  }
  return score - 20
}
async function parsePageLinks(html: string, db: IDBPDatabase): Promise<number> {
  console.log('parsePageLinks')
  let score = 0
  const LINK_START = '<a href=\'/browseStores.asp'
  const LINK_END = '\'>'
  let nextIndex = html.indexOf(LINK_START)
  while (nextIndex !== -1) {
    const endOfLink = html.indexOf(LINK_END, nextIndex + LINK_START.length)
    const link = html.substring(nextIndex + LINK_START.length, endOfLink)
    if (
      nextIndex === -1 ||
      endOfLink === -1
    ) {
      break
    }
    nextIndex = html.indexOf(LINK_START, endOfLink)
    if (link === '?viewClosed=Y') {
      continue
    }
    const key = await addBrickLinkStorePage(db, {
      url: "https://www.bricklink.com/browseStores.asp" + link,
      nextScrape: new Date(),
      scrapeMultiplier: 1
    })
    if (!!key) {
      score++
    }
  }
  return score - 20
}

async function getBrickLinkStoreBySlug(db: IDBPDatabase, slug: string): Promise<Store | undefined> {
  return await getFromIndex<Store>(db, indices.STORES_BY_TYPE_AND_SLUG, [StoreType.BrickLink, slug])
}

async function importBrickLinkStore(db: IDBPDatabase, slug: string, name: string): Promise<boolean> {
  const existingStore = await getBrickLinkStoreBySlug(db, slug)
  if (existingStore) {
    return false
  }
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
  let storeHtml = await storePage.text()
  const countryId = extractValue(storeHtml, 'countryID: \t\t\'', '\',')
  if (!countryId) {
    return false
  }
  const storeCountry = await get(db, STORES.STORE_COUNTRIES, countryId)
  if (!storeCountry) {
    const countryName = extractValue(storeHtml, 'countryName: \t\'', '\',')
    if (countryName) {
      const response = await addStoreCountry(db, countryId, countryName)
      if (!response) {
        return false
      }
    }
  }
  const id = extractValue(storeHtml, 'id: \t\t\t', ',')
  if (!id) {
    return false
  }
  const result = await addStore(name, id, [], slug, 100, db, StoreType.BrickLink, countryId)
  return !!result
}

function extractValue(str: string, start: string, end: string): string | undefined {
  const startIndex = str.indexOf(start)
  if (startIndex === -1) {
    return
  }
  const endIndex = str.indexOf(end, startIndex + start.length)
  if (endIndex === -1) {
    return
  }
  return str.substring(startIndex + start.length, endIndex).trim()
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
import { createIndex, createStore, get, getFromIndex, put } from './db';
import { addColor } from './colors';
import { addShopListDb } from './lists';
import { addStore, createInitialStores } from './storeMethods';
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
import stores from './stores';
import { addMinutes } from '../utils';
import indices from './indices';
import { addStoreCountry } from './storeCountries';
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

let dbConnection: IDBPDatabase | undefined

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


