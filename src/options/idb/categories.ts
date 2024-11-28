import { IDBPDatabase } from "idb"
import { BrickLinkCategoriesPageCategory, BrickLinkCategory, CategoriesPageCategory, Category, CategoryPageCategory, CategoryPagePart, Item, ItemVariant, SearchFilter, UiCategory } from "../types"
import { get, getAllKeys, getFromIndex, put } from "./db"
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

export async function getBrickLinkCategories(ids: string[]): Promise<Category[]> {
  const db = await getDbConnection()
  return await Promise.all(ids.map(id => {
     return get(db, STORES.CATEGORIES_BRICKLINK, id)
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
export async function excludeBrickLinkCategory(category: Category) {
  const activeSearch = await getActiveSearch()
  activeSearch.categoriesBrickLink.excluded.push(category.id)
  storeActiveSearch(activeSearch)
}
export async function includeCategory(category: Category) {
  const activeSearch = await getActiveSearch()
  activeSearch.categories.included.push(category.id)
  storeActiveSearch(activeSearch)
}
export const excludedCategories = ref<Category[]>([])
export async function getExcludedCategories(): Promise<Category[] | undefined> {
  return excludedCategories.value
}
export async function getCategoriesPageCategory(db: IDBPDatabase, category: Category): Promise<CategoriesPageCategory> {
  const numParts = await getNumPartsInCategory(db, category.id)
  const image = await getCategoryImage(db, category.id)
  return {
    ...category,
    numParts,
    image
  }
}
export async function getCategoryImage(db: IDBPDatabase, id: string): Promise<string | undefined> {
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

export async function getBrickLinkCategoriesPageCategory(db: IDBPDatabase, category: BrickLinkCategory): Promise<BrickLinkCategoriesPageCategory> {
  const numParts = await getNumPartsInBrickLinkCategory(db, category)
  const image = await getBrickLinkCategoryImage(db, category)
  return {
    ...category,
    numParts,
    image
  }
}
export async function getBrickLinkCategoriesPageCategories(): Promise<BrickLinkCategoriesPageCategory[]> {
  const db = await getDbConnection()
  const categories = await db.getAll(STORES.CATEGORIES_BRICKLINK.name)
  const categoriesPageCategories: BrickLinkCategoriesPageCategory[] = []
  const activeSearch = await getActiveSearch()
  for (let i = 0; i < categories.length; i++) {
    const category: BrickLinkCategory = categories[i]
    if (
      activeSearch.categoriesBrickLink.excluded.includes(category.id)
    ) {
      continue
    }
    if (
      activeSearch.categoriesBrickLink.included.length > 0 &&
      !activeSearch.categoriesBrickLink.included.includes(category.id)
    ) {
      continue
    }
    const categoriesPageCategory: BrickLinkCategoriesPageCategory = await getBrickLinkCategoriesPageCategory(db, category)
    categoriesPageCategories.push(categoriesPageCategory)
  }
  return categoriesPageCategories.sort((a, b) => Number.parseInt(a.id) - Number.parseInt(b.id))
}
export async function getCategoriesPageCategories(): Promise<CategoriesPageCategory[]> {
  const db = await getDbConnection()
  const categories = await db.getAll(STORES.CATEGORIES.name)
  const categoriesPageCategories: CategoriesPageCategory[] = []
  const activeSearch = await getActiveSearch()
  for (let i = 0; i < categories.length; i++) {
    const category: Category = categories[i]
    // if (
    //   activeSearch.categories.excluded.includes(category.id)
    // ) {
    //   continue
    // }
    // if (
    //   activeSearch.categories.included.length > 0 &&
    //   !activeSearch.categories.included.includes(category.id)
    // ) {
    //   continue
    // }
    const categoriesPageCategory: CategoriesPageCategory = await getCategoriesPageCategory(db, category)
    categoriesPageCategories.push(categoriesPageCategory)
  }
  return categoriesPageCategories.filter(category => category.numParts > 0).sort((a, b) => Number.parseInt(a.id) - Number.parseInt(b.id))
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

export async function addBrickLinkCategory(db: IDBPDatabase, id: string, name: string) {
  await put(db, STORES.CATEGORIES_BRICKLINK, { id, name, categoryIds: [] })
}

export async function addCategory(
  db: IDBPDatabase,
  id: string,
  name: string,
) {
  const category = {
    id,
    name
  }
  await db.put(STORES.CATEGORIES.name, category)
  await addUiCategory(db, category)
}

export async function addCategoryToBrickLinkCategory(
  db: IDBPDatabase,
  brickLinkCategoryId: string,
  categoryId: string
) {
  const brickLinkCategory = await get(db, STORES.CATEGORIES_BRICKLINK, brickLinkCategoryId)
  if (!brickLinkCategory.categoryIds) {
    brickLinkCategory.categoryIds = []
  }
  if (brickLinkCategory.categoryIds.includes(categoryId)) {
    return
  }
  brickLinkCategory.categoryIds.push(categoryId)
  await put(db, STORES.CATEGORIES_BRICKLINK, brickLinkCategory)
}
export async function updateCategory(
  db: IDBPDatabase,
  category: Category
) {
  await put(db, STORES.CATEGORIES, category)
}

export async function loadCategories(db: IDBPDatabase) {
  const x = await db.getAll(STORES.CATEGORIES.name)
  for (let i = 0; i < x.length; i++) {
    const category: Category = x[i]
    addUiCategory(db, category)
  }
}

async function addUiCategory(db: IDBPDatabase, category: Category) {
  try {
    const numParts = await db.countFromIndex(STORES.PARTS.name, INDICES.PARTS_BY_CATEGORY.name, category.id)
    categories.value.set(category.id, {
      ...category,
      numParts
    })
  } catch (e) {
    console.log(e)
  }
}

export async function getCategory(db: IDBPDatabase, id: string): Promise<Category> {
  return await get(db, STORES.CATEGORIES, id)
}

