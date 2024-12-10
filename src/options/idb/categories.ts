import { IDBPDatabase } from "idb"
import { BrickLinkCategory, CachedCategory, CachedExternalCategory, CategoriesPageCategory, Category, CategoryPageCategory, CategoryPagePart, ExternalCategory, ExternalCategoryPageExternalCategory, ExternalItem, Item, ItemVariant, LegoCategory, PartPageCategory, RebrickableCategory, SearchFilter, UiCategory } from "../types"
import { get, getAllFromIndex, getAllKeys, getFromIndex, put } from "./db"
import STORES from './stores'
import INDICES from './indices'
import { activeSearch, getCategoriesPageCategory, getDbConnection, liveObjectCache } from "./idb"
import { getCategoryPageParts } from "./parts"
import ObjectCache from "./ObjectCacheClass"
export const categories = ref<Map<string, UiCategory>>(new Map<string, UiCategory>())

export async function getCategoriesCount(db: IDBPDatabase): Promise<number | undefined> {
  const all = await getAllKeys(db, STORES.CATEGORIES)
  const search = activeSearch.value
  if (!search) {
    return
  }
  return all.filter(key => {
    if (typeof key !== 'number') {
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
  return await filterCategory(category, true)
}
export async function includeCategory(category: Category) {
  return await filterCategory(category, false)
}
export async function filterCategory(category: Category, isExcluded: boolean) {
  const search = activeSearch.value
  if (!search) {
    return
  }
  const db = await getDbConnection()
  const filter: SearchFilter = {
    searchId: search.id,
    type: 'category',
    objectId: category.id,
    isExcluded
  }
  await db.put(STORES.SEARCH_FILTERS.name, filter)
}
export const excludedCategories = ref<Category[]>([])
export async function getExcludedCategories(): Promise<Category[] | undefined> {
  return excludedCategories.value
}

export async function getExternalCategories(db: IDBPDatabase, categoryId: number): Promise<ExternalCategory[]> {
  return await getAllFromIndex(db, INDICES.EXTERNAL_CATEGORIES_BY_CATEGORY, categoryId)
}

export async function getCategoryImage(db: IDBPDatabase, id: number): Promise<string | undefined> {
  const externalCategories = await getExternalCategories(db, id)
  for (let i = 0; i < externalCategories.length; i++) {
    const parts: Item[] = await getAllFromIndex(db, INDICES.EXTERNAL_PARTS_BY_CATEGORY, id)
    if (!parts) {
      continue
    }
    for (let j = 0; j < parts.length; j++) {
      const part = parts[j]
      const variants: ItemVariant[] = await getAllFromIndex(db, INDICES.PART_VARIANTS_BY_PART, part.itemId)
      const variant = variants.find((v) => v.image)
      if (variant) {
        return variant.image
      }
    }
  }
}

export async function getExternalCategoryImage(db: IDBPDatabase, category: ExternalCategory): Promise<string | undefined> {
  const externalPart: ExternalItem = await getFromIndex(db, INDICES.EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY, [category.type, category.id])
  if (!externalPart) {
    return
  }
  const variant: ItemVariant = await getFromIndex(db, INDICES.PART_VARIANTS_BY_TYPE_AND_PART, [externalPart.type, externalPart.externalItemId])
  if (!variant) {
    return
  }
  return variant.image
}

export async function getAllCategories(db: IDBPDatabase): Promise<CachedCategory[]> {
  return await db.getAll(STORES.CATEGORIES.name)
}

export async function getAllExternalCategories(db: IDBPDatabase): Promise<CachedExternalCategory[]> {
  return await db.getAll(STORES.EXTERNAL_CATEGORIES.name)
}

export async function getExternalCategoriesByCategoryId(id: number, objectCache: ObjectCache) {
  return await getAllFromIndex(objectCache.db, INDICES.EXTERNAL_CATEGORIES_BY_CATEGORY, id)
}

export async function getExternalCategoryPageExternalCategory(type: 'BrickLink' | 'Lego' | 'Rebrickable', id: string): Promise<ExternalCategoryPageExternalCategory | undefined> {
  const externalCategory = await liveObjectCache.getExternalCategory(id, type)
  if (!externalCategory) { 
    return
  }
  const category = await liveObjectCache.getCategory(externalCategory.categoryId)
  if (!category) {
    return
  }
  const externalCategories = await liveObjectCache.getExternalCategoriesByCategoryId(category.id)
  if (!externalCategories) {
    return
  }
  const externalParts = await liveObjectCache.getExternalPartsInExternalCategory(type, id)
  return {
    ...externalCategory,
    category: {
      ...category,
      externalCategories
    },
    externalParts
  }
}

export async function getCategoriesPageCategories(objectCache: ObjectCache): Promise<CategoriesPageCategory[] | undefined> {
  const db = objectCache.db
  const categories = await getAllCategories(db)
  const categoriesPageCategories: CategoriesPageCategory[] = []
  const search = await objectCache.getActiveSearch()
  if (!search) {
    return
  }
  for (let i = 0; i < categories.length; i++) {
    const category: CachedCategory = categories[i]
    if (
      search.categories.excluded.includes(category.id)
    ) {
      continue
    }
    if (
      search.categories.included.length > 0 &&
      !search.categories.included.includes(category.id)
    ) {
      continue
    }
    const categoriesPageCategory = await getCategoriesPageCategory(category, objectCache)
    if (!categoriesPageCategory || categoriesPageCategory.externalCategories.length === 0) {
      console.log(categoriesPageCategory, category)
      continue
    }
    categoriesPageCategories.push(categoriesPageCategory)
  }
  return categoriesPageCategories
    .sort((a, b) => a.id - b.id)
}

export async function getCategoryPageCategory(id: number): Promise<CategoryPageCategory | undefined> {
  const db = await getDbConnection()
  const category: Category = await get(db, STORES.CATEGORIES, id)
  if (!category) {
    return
  }
  const externalCategories: ExternalCategory[] = await getExternalCategories(db, id)
  const parts: CategoryPagePart[] = await getCategoryPageParts(db, id)
  console.log(parts)
  return {
    ...category,
    parts,
    externalCategories
  }
}

export async function addCategory(db: IDBPDatabase): Promise<number | undefined> {
  const id = await db.put(STORES.CATEGORIES.name, {})
  if (typeof id !== 'number') {
    return
  }
  return id
}

export async function addBrickLinkCategory(
  db: IDBPDatabase,
  brickLinkCategoryId: string,
  brickLinkCategoryName: string,
  categoryId: number
) {
  const brickLinkCategory: ExternalCategory = {
    categoryId,
    id: brickLinkCategoryId,
    name: brickLinkCategoryName,
    type: "BrickLink"
  }
  await putExternalCategory(db, brickLinkCategory)
}
export async function putExternalCategory(db: IDBPDatabase, category: ExternalCategory) {
  return await put(db, STORES.EXTERNAL_CATEGORIES, category)
}
export async function updateCategory(
  db: IDBPDatabase,
  category: Category
) {
  await put(db, STORES.CATEGORIES, category)
}

export async function getCategory(db: IDBPDatabase, id: number): Promise<Category> {
  return await get(db, STORES.CATEGORIES, id)
}
export async function getExternalCategory<T extends ExternalCategory>(db: IDBPDatabase, id: string, type: "BrickLink" | "Lego" | "Rebrickable"): Promise<T> {
  return await get(db, STORES.EXTERNAL_CATEGORIES, [type, id])
}
export async function getBrickLinkCategory(db: IDBPDatabase, id: string): Promise<BrickLinkCategory> {
  return await getExternalCategory<BrickLinkCategory>(db, id, 'BrickLink')
}
export async function getRebrickableCategory(db: IDBPDatabase, id: string): Promise<RebrickableCategory> {
  return await getExternalCategory<RebrickableCategory>(db, id, 'Rebrickable')
}
export async function getLegoCategory(db: IDBPDatabase, id: string): Promise<LegoCategory> {
  return await getExternalCategory<LegoCategory>(db, id, 'Lego')
}
export async function getPartPageCategory(db: IDBPDatabase, id: string): Promise<PartPageCategory> {
  return await get(db, STORES.CATEGORIES, id)
}

