import { IDBPDatabase } from "idb"
import { BrickLinkCategory, CategoriesPageCategory, CategoriesPageExternalCategory, Category, CategoryPageCategory, CategoryPagePart, ExternalCategory, ExternalItem, Item, ItemVariant, ItemWithExternals, LegoCategory, PartPageCategory, RebrickableCategory, SearchFilter, UiCategory } from "../types"
import { get, getAllFromIndex, getAllKeys, getFromIndex, put } from "./db"
import STORES from './stores'
import INDICES from './indices'
import { getDbConnection } from "./idb"
import { getNumPartsInCategory, getCategoryPageParts } from "./parts"
import { getActiveSearch } from "./searches"
export const categories = ref<Map<string, UiCategory>>(new Map<string, UiCategory>())

export async function getCategoriesCount(db: IDBPDatabase): Promise<number> {
  const all = await getAllKeys(db, STORES.CATEGORIES)
  const search = await getActiveSearch()
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
  const activeSearch = await getActiveSearch()
  const db = await getDbConnection()
  const filter: SearchFilter = {
    searchId: activeSearch.id,
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

export async function getCategoriesPageCategory(db: IDBPDatabase, category: Category): Promise<CategoriesPageCategory> {
  const externalCategories = await getExternalCategories(db, category.id)
  const categoriesPageExternalCategory: CategoriesPageExternalCategory[] = []
  for (let i = 0; i < externalCategories.length; i++) {
    const externalCategory = externalCategories[i]
    const numParts = await getNumPartsInCategory(db, category.id)
    const image = await getExternalCategoryImage(db, externalCategory)
    if (numParts === 0) {
      continue
    }
    categoriesPageExternalCategory.push({
      ...externalCategory,
      numParts,
      image
    })
  }
  return {
    ...category,
    externalCategories: categoriesPageExternalCategory,
  }
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
    if (categoriesPageCategory.externalCategories.length === 0) {
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

