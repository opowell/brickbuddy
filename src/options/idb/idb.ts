import { CachedExternalCategory, CategoriesPageCategory, CategoriesPageExternalCategory, Category, ExternalCategory, RebrickableItem, Search, SearchFilter } from './../types';
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
import { createIndex, createStore, put } from './db';
import { addColor } from './colors';
import { addShopListDb } from './lists';
import { createInitialStores } from './storeMethods';
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


