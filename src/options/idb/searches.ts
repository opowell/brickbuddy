import { IDBPDatabase } from "idb"
import { Search, UiStore, CartWithItems, ActiveSearch, ActiveSearchButtonActiveSearch, SearchesPageSearch, Item, SearchPageSearch, SearchFilter, ExternalItem } from "../types"
import { getCategories, getCategory } from "./categories"
import { getCondition } from "./condition"
import { getAll, getAllFromIndex, getFromIndex } from "./db"
import { getDbConnection } from "./idb"
import STORES from "./stores"
import INDICES from './indices'
import ObjectCacheClass from "./ObjectCacheClass"

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

export async function getActiveCart(): Promise<CartWithItems> {
  const db = await getDbConnection()
  const objectCache = new ObjectCacheClass(db)
  return await objectCache.getActiveCart()
}
export async function getActiveSearch(): Promise<ActiveSearch> {
  const db = await getDbConnection()
  const objectCache = new ObjectCacheClass(db)
  return await objectCache.getActiveSearch()
}
export async function getActiveSearchButtonActiveSearch(): Promise<ActiveSearchButtonActiveSearch> {
  const search = await getActiveSearch()
  const activeSearch: ActiveSearchButtonActiveSearch = {
    ...search,
    categories: {
      excluded: search.categories.excluded,
      excludedNames: (await getCategories(search.categories.excluded)).map(category => category.name),
      included: search.categories.included,
      includedNames: (await getCategories(search.categories.included)).map(category => category.name)
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
  return activeSearch
}

export async function getFirstActiveSearch(db: IDBPDatabase): Promise<Search | undefined> {
  return await getFromIndex(db, INDICES.SEARCHES_BY_ACTIVE, 1)
}

export async function getAllSearches(db: IDBPDatabase): Promise<Search[]> {
  return await getAll(db, STORES.SEARCHES)
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

export async function setPriceScoreQuantity(quantity: number) {
  const search = await getActiveSearch()
  search.priceScoreQuantity = quantity
  const db = await getDbConnection()
  db.put(STORES.SEARCHES.name, search)
}

export async function getSearchFilters(db: IDBPDatabase, search: Search): Promise<SearchFilter[]> {
  return await getAllFromIndex(db, INDICES.SEARCH_FILTERS_BY_SEARCH, search.id)
}

export async function getSearchPageSearch(id: number): Promise<SearchPageSearch> {
  const search: ActiveSearch = await getActiveSearch()
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
    const category = await getCategory(db, id)
    activeSearchPageSearch.includedCategoryObjects.push(await getCategoriesPageCategory(db, category))
  }
  for (let i = 0; i < search.categories.excluded.length; i++) {
    const id = search.categories.excluded[i]
    const category = await getCategory(db, id)
    activeSearchPageSearch.excludedCategoryObjects.push(await getCategoriesPageCategory(db, category))
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
