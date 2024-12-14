import { IDBPDatabase } from "idb"
import { Search, CartWithItems, ActiveSearch, ActiveSearchButtonActiveSearch, SearchesPageSearch, Item, SearchPageSearch, SearchFilter, ExternalItem, CachedSearch } from "../types"
import { getCategories } from "./categories"
import { getCondition } from "./condition"
import { get, getAll, getAllFromIndex, getFromIndex } from "./db"
import { getCategoriesPageCategory, getDbConnection, liveObjectCache } from "./idb"
import STORES from "./stores"
import INDICES from './indices'

export async function addNewSearch() {
  const db = await getDbConnection()
  const newSearch: Search = {
    id: 0,
    name: new Date().toISOString(),
    active: 0,
    priceScoreIgnoreColor: true,
    priceScoreQuantity: 100
  }
  db.put(STORES.SEARCHES.name, newSearch)
  return newSearch
}

export async function getActiveCart(): Promise<CartWithItems | undefined> {
  return await liveObjectCache.getActiveCart()
}
export async function getActiveSearchButtonActiveSearch(): Promise<ActiveSearchButtonActiveSearch | undefined> {
  const db = await getDbConnection()
  const search = await getFirstActiveSearch(db)
  if (!search) {
    return
  }
  const activeSearchButtonActiveSearch: ActiveSearchButtonActiveSearch = {
    ...search,
    categories: {
      excluded: search.categories.excluded,
      excludedNames: (await getCategories(search.categories.excluded)).map(category => category?.id + ''),
      included: search.categories.included,
      includedNames: (await getCategories(search.categories.included)).map(category => category?.id + '')
    },
    colors: {
      excluded: search.colors.excluded,
      excludedNames: [],
      included: search.colors.included,
      includedNames: []
    },
    conditions: {
      excluded: search.conditions.excluded,
      excludedNames: search.conditions.excluded,
      included: search.conditions.included,
      includedNames: search.conditions.included
    },
    stores: {
      excluded: search.stores.excluded,
      excludedNames: [],
      included: search.stores.included,
      includedNames: []
    },
    parts: {
      excluded: search.parts.excluded,
      excludedNames: [],
      included: search.parts.included,
      includedNames: []
    }
  }
  return activeSearchButtonActiveSearch
}

export async function getFirstActiveSearch(db: IDBPDatabase): Promise<ActiveSearch | undefined> {
  const search = await getFromIndex<Search>(db, INDICES.SEARCHES_BY_ACTIVE, 1)
  if (!search) {
    return
  }
  const activeSearch = await loadSearchFilters(search)
  return activeSearch
}

export async function getAllSearches(db: IDBPDatabase): Promise<CachedSearch[] | undefined> {
  return await getAll(db, STORES.SEARCHES)
}

export async function getAllSearchFilters(db: IDBPDatabase): Promise<SearchFilter[] | undefined> {
  return await getAll(db, STORES.SEARCH_FILTERS)
}

export async function getSearchesPagesSearches(): Promise<SearchesPageSearch[]> {
  const db = await getDbConnection()
  const searches = await getAllSearches(db)
  const searchesPageSearches: SearchesPageSearch[] = []
  for (let i = 0; i < searches.length; i++) {
    const search = searches[i]
    searchesPageSearches.push({
      ...search
    })
  }
  return searchesPageSearches
}

export async function searchAllowsPart(db: IDBPDatabase, search: Search, part: ExternalItem) {
  return true // TODO
}

export async function getActiveSearch() {
  return await liveObjectCache.getActiveSearch()
}

export async function setPriceScoreQuantity(quantity: number) {
  const search = await getActiveSearch()
  if (!search) {
    return
  }
  search.priceScoreQuantity = quantity
  const db = await getDbConnection()
  db.put(STORES.SEARCHES.name, search)
}

export async function getSearchFilters(db: IDBPDatabase, search: Search): Promise<SearchFilter[]> {
  return await getAllFromIndex(db, INDICES.SEARCH_FILTERS_BY_SEARCH, search.id)
}

export async function getSearch(id: number): Promise<ActiveSearch | undefined> {
  const search = await get<Search>(liveObjectCache.db, STORES.SEARCHES, id)
  if (!search) {
    return
  }
  const activeSearch = await loadSearchFilters(search)
  return activeSearch
}

async function loadSearchFilters(search: Search): Promise<ActiveSearch> {
  const filters: SearchFilter[] = await getAllFromIndex(liveObjectCache.db, INDICES.SEARCH_FILTERS_BY_SEARCH, search.id)
  const filterTypes = [
    {
      arrayName: 'categories',
      type: 'category'
    },
    {
      arrayName: 'colors',
      type: 'color'
    },
    {
      arrayName: 'conditions',
      type: 'condition'
    },
    {
      arrayName: 'stores',
      type: 'store'
    },
    {
      arrayName: 'parts',
      type: 'part'
    }
  ]
  const activeSearch = {
    ...search,
    filters
  }
  filterTypes.forEach(ft => {
    const included = filters.filter(f => f.type === ft.type && !f.isExcluded).map(f => f.objectId)
    const excluded = filters.filter(f => f.type === ft.type && f.isExcluded).map(f => f.objectId)
    // @ts-ignore
    activeSearch[ft.arrayName] = {
      included,
      excluded
    }
  })
  // @ts-ignore
  return activeSearch
}

export async function getSearchPageSearch(id: number): Promise<SearchPageSearch | undefined> {
  const search = await getSearch(id)
  if (!search) {
    return
  }
  const activeSearchPageSearch: SearchPageSearch = {
    ...search,
    includedConditionObjects: [],
    excludedConditionObjects: [],
    includedCategoryObjects: [],
    excludedCategoryObjects: [],
    colorObjects: [],
    partObjects: [],
    storeObjects: []
  }
  const db = await getDbConnection()
  for (let i = 0; i < search.categories.included.length; i++) {
    const id = search.categories.included[i]
    const category = await liveObjectCache.getCategory(id)
    if (!category) {
      continue
    }
    const cpc = await getCategoriesPageCategory(category)
    if (!cpc) {
      continue
    }
    activeSearchPageSearch.includedCategoryObjects.push(cpc)
  }
  for (let i = 0; i < search.categories.excluded.length; i++) {
    const id = search.categories.excluded[i]
    const category = await liveObjectCache.getCategory(id)
    if (!category) {
      continue
    }
    const cpc = await getCategoriesPageCategory(category)
    if (!cpc) {
      continue
    }    
    activeSearchPageSearch.excludedCategoryObjects.push(cpc)
  }
  for (let i = 0; i < search.conditions.included.length; i++) {
    const id = search.conditions.included[i]
    const conditionObject = await getCondition(db, id)
    activeSearchPageSearch.includedConditionObjects.push(conditionObject)
  }
  for (let i = 0; i < search.conditions.excluded.length; i++) {
    const id = search.conditions.excluded[i]
    const conditionObject = await getCondition(db, id)
    activeSearchPageSearch.excludedConditionObjects.push(conditionObject)
  }
  return activeSearchPageSearch
}
