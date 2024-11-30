import { IDBPDatabase } from "idb"
import { BrickLinkCategory, CategoriesPageCategory, Category, CategoryPageCategory, CategoryPagePart, ExternalCategory, Item, ItemVariant, SearchFilter, UiCategory } from "../types"
import { get, getAllFromIndex, getAllKeys, getFromIndex, put } from "./db"
import STORES from './stores'
import INDICES from './indices'
import { getDbConnection, getBrickLinkCategoryImage } from "./idb"
import { getNumPartsInCategory, getNumPartsInBrickLinkCategory, getPartsInCategory, getCategoryPagePart } from "./parts"
import { getActiveSearch, storeActiveSearch } from "./searches"
export const categories = ref<Map<string, UiCategory>>(new Map<string, UiCategory>())

export async function getCategoriesCount(db: IDBPDatabase): Promise<number> {
  const all = await getAllKeys(db, STORES.CATEGORIES)
  const search = await getActiveSearch()
  return all.filter(key => {
    if (typeof key !== 'string') {
      return true
    }
    if (search.categories.excluded.includes(key)) {
      return false
    }
    if (search.categories.included.length > 0) {
      if (!search.categories.included.includes(key)) {
        return false
      }
    }
    return true
  }).length
}

export async function getCategories(ids: string[]): Promise<Category[]> {
  const db = await getDbConnection()
  return await Promise.all(ids.map(id => {
     return get(db, STORES.CATEGORIES, id)
  }))
}

export async function excludeCategory(category: Category) {
  const activeSearch = await getActiveSearch()
  const db = await getDbConnection()
  const filter: SearchFilter = {
    searchId: activeSearch.id,
    type: 'category',
    objectId: category.id,
    isExcluded: true
  }
  await db.put(STORES.SEARCH_FILTERS.name, filter)
}
export async function filterBrickLinkCategory(category: BrickLinkCategory, isExcluded: boolean) {
  const activeSearch = await getActiveSearch()
  const db = await getDbConnection()
  const filter: SearchFilter = {
    searchId: activeSearch.id,
    type: 'brickLinkCategory',
    objectId: category.id,
    isExcluded: true
  }
  db.put(STORES.SEARCH_FILTERS.name, filter, [activeSearch.id, 'brickLinkCategory', category.id])
}
export async function excludeBrickLinkCategory(category: BrickLinkCategory) {
  return await filterBrickLinkCategory(category, true)
}
export async function includeCategory(category: BrickLinkCategory) {
  return await filterBrickLinkCategory(category, false)
}
export const excludedCategories = ref<Category[]>([])
export async function getExcludedCategories(): Promise<Category[] | undefined> {
  return excludedCategories.value
}

async function getExternalCategories(db: IDBPDatabase, categoryId: number) {
  return await getAllFromIndex(db, INDICES.EXTERNAL_CATEGORIES_BY_CATEGORY, categoryId)
}

export async function getCategoriesPageCategory(db: IDBPDatabase, category: Category): Promise<CategoriesPageCategory> {
  const numParts = await getNumPartsInCategory(db, category.id)
  const image = await getCategoryImage(db, category.id)
  const externalCategories = await getExternalCategories(db, category.id)
  return {
    ...category,
    numParts,
    image,
    externalCategories
  }
}
export async function getCategoryImage(db: IDBPDatabase, id: number): Promise<string | undefined> {
  const part: Item = await getFromIndex(db, INDICES.PARTS_BY_CATEGORY, id)
  if (!part) {
    return
  }
  const variant: ItemVariant = await getFromIndex(db, INDICES.PART_VARIANTS_BY_PART, part.itemId)
  if (!variant) {
    return
  }
  return variant.image
}

export async function getCategoriesPageCategories(): Promise<CategoriesPageCategory[]> {
  const db = await getDbConnection()
  const categories = await db.getAll(STORES.CATEGORIES.name)
  const categoriesPageCategories: CategoriesPageCategory[] = []
  const activeSearch = await getActiveSearch()
  for (let i = 0; i < categories.length; i++) {
    const category: Category = categories[i]
    if (
      activeSearch.categories.excluded.includes(category.id)
    ) {
      continue
    }
    if (
      activeSearch.categories.included.length > 0 &&
      !activeSearch.categories.included.includes(category.id)
    ) {
      continue
    }
    const categoriesPageCategory: CategoriesPageCategory = await getCategoriesPageCategory(db, category)
    categoriesPageCategories.push(categoriesPageCategory)
  }
  return categoriesPageCategories
    // .filter(category => category.numParts > 0)
    .sort((a, b) => a.id - b.id)
}

export async function getCategoryPageCategory(id: string): Promise<CategoryPageCategory | undefined> {
  const db = await getDbConnection()
  const category: Category = await get(db, STORES.CATEGORIES, id)
  if (!category) {
    return
  }
  const parts: Item[] = await getPartsInCategory(db, id)
  const uiParts: CategoryPagePart[] = []
  for (let i = 0; i < parts.length; i++) {
    const uiPart: CategoryPagePart = await getCategoryPagePart(db, parts[i])
    uiParts.push(uiPart)
  }
  return {
    ...category,
    parts: uiParts,
  }
}

export async function addCategory(db: IDBPDatabase): Promise<IDBValidKey> {
  return await db.put(STORES.CATEGORIES.name, {})
}

export async function addBrickLinkCategory(
  db: IDBPDatabase,
  brickLinkCategoryId: string,
  brickLinkCategoryName: string
) {
  const categoryId = await addCategory(db)
  const brickLinkCategory: ExternalCategory = {
    categoryId,
    id: brickLinkCategoryId,
    name: brickLinkCategoryName,
    type: "BrickLink"
  }
  await putExternalCategory(db, brickLinkCategory)
}
async function putExternalCategory(db: IDBPDatabase, category: ExternalCategory) {
  return await put(db, STORES.EXTERNAL_CATEGORIES, category)
}
export async function updateCategory(
  db: IDBPDatabase,
  category: Category
) {
  await put(db, STORES.CATEGORIES, category)
}

export async function getCategory(db: IDBPDatabase, id: string): Promise<Category> {
  return await get(db, STORES.CATEGORIES, id)
}
export async function getBrickLinkCategory(db: IDBPDatabase, id: string): Promise<BrickLinkCategory> {
  return await get(db, STORES.EXTERNAL_CATEGORIES, id)
}
export async function getPartPageCategory(db: IDBPDatabase, id: string): Promise<PartPageCategory> {
  return await get(db, STORES.CATEGORIES, id)
}

