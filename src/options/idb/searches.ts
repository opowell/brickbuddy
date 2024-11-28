import { IDBPDatabase } from "idb"
import { UiSearch, Search, UiStore, CartWithItems, ActiveSearch, ActiveSearchButtonActiveSearch, SearchesPageSearch, SearchBase, Item, SearchPageSearch, SearchFilter } from "../types"
import { getCategories, getBrickLinkCategories, getCategory, getCategoriesPageCategory } from "./categories"
import { getCondition } from "./condition"
import { getAllFromIndex, getFromIndex } from "./db"
import { getDbConnection } from "./idb"
import { lists } from "./lists"
import STORES from "./stores"
import INDICES from './indices'
import ObjectCacheClass from "./ObjectCacheClass"
import stores from "./stores"

export const openSearch = ref<UiSearch | null>(null)

export async function addNewSearch(name: string) {
  const db = await getDbConnection()
  await addSearch(name, db)
}
async function addSearch(name: string, db: IDBPDatabase) {
  const newSearch = {
    name,
    storeIds: []
  }
  db.put(STORES.SEARCHES.name, newSearch)
  const newUiSearch: UiSearch = {
    ...newSearch,
    stores: []
  }
  searches.value.push(newUiSearch)
  return newUiSearch
}

export async function addSearchStore(storeId: string) {
  if (!openSearch.value) {
    return
  }
  const store = stores.value.find(store => store.sId === storeId)
  if (!store) {
    return
  }
  openSearch.value.storeIds.push(storeId)
  openSearch.value.stores?.push(store)
  const db = await getDbConnection()
  const search: Search = {
    id: openSearch.value.id,
    name: openSearch.value.name,
    shoppingListId: openSearch.value.shoppingListId,
    storeIds: [...openSearch.value.storeIds]
  }
  await db.put(STORES.SEARCHES.name, search)
}

export async function searchRemoveStore(store: UiStore) {
  if (!openSearch.value) {
    return
  }
  openSearch.value.storeIds.filter(id => id !== store.sId)
  const db = await getDbConnection()
  const search: Search = {
    id: openSearch.value.id,
    name: openSearch.value.name,
    shoppingListId: openSearch.value.shoppingListId,
    storeIds: [...openSearch.value.storeIds]
  }
  await db.put(STORES.SEARCHES.name, search)
}
export async function setSearchShopList(listId: number) {
  if (!openSearch.value) {
    return
  }
  openSearch.value.shoppingList = lists.value?.find(list => list.id === listId)
  openSearch.value.shoppingListId = listId
  const db = await getDbConnection()
  const search: Search = {
    id: openSearch.value.id,
    name: openSearch.value.name,
    shoppingListId: openSearch.value.shoppingListId,
    storeIds: [...openSearch.value.storeIds]
  }
  await db.put(STORES.SEARCHES.name, search)
}

export async function getActiveCart(): Promise<CartWithItems> {
  const db = await getDbConnection()
  const objectCache = new ObjectCacheClass(db)
  return await objectCache.getActiveCart()
}
export async function getActiveSearch(): Promise<Search> {
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
    categoriesBrickLink: {
      excluded: search.categoriesBrickLink.excluded,
      excludedNames: (await getBrickLinkCategories(search.categoriesBrickLink.excluded)).map(category => category.name),
      included: search.categoriesBrickLink.included,
      includedNames: (await getBrickLinkCategories(search.categoriesBrickLink.included)).map(category => category.name)
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

export async function getSearchesPagesSearches(): Promise<SearchesPageSearch[]> {
  const db = await getDbConnection()
  const searches = await db.getAll(STORES.SEARCHES.name)
  const searchesPageSearches: SearchesPageSearch[] = []
  for (let i = 0; i < searches.length; i++) {
    const search = searches[i]
    searchesPageSearches.push({
      ...search
    })
  }
  return searchesPageSearches
}

export async function searchAllowsPart(db: IDBPDatabase, search: SearchBase, part: Item) {
  if (part.brickLinkCategoryId && search.categoriesBrickLink.excluded.includes(part.brickLinkCategoryId)) {
    return false
  }
  return true // TODO
}

export function storeActiveSearch(activeSearch: ActiveSearch) {
  const toStore: ActiveSearch = {
    categories: {
      included: activeSearch.categories.included,
      excluded: activeSearch.categories.excluded
    },
    categoriesBrickLink: {
      included: activeSearch.categoriesBrickLink.included,
      excluded: activeSearch.categoriesBrickLink.excluded
    },
    colors: activeSearch.colors,
    parts: activeSearch.parts,
    conditions: activeSearch.conditions,
    stores: activeSearch.stores,
    priceScoreQuantity: activeSearch.priceScoreQuantity,
    priceScoreIgnoreColor: activeSearch.priceScoreIgnoreColor
  }
  localStorage.setItem('activeSearch', JSON.stringify(toStore))
}

export async function setPriceScoreQuantity(quantity: number) {
  const search = await getActiveSearch()
  search.priceScoreQuantity = quantity
  storeActiveSearch(search)
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
