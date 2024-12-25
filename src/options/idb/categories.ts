import { IDBPDatabase } from 'idb'
import {
  BrickLinkCategory,
  CachedCategory,
  CachedExternalCategory,
  CategoriesPageCategory,
  Category,
  CategoryPageCategory,
  CategoryPagePart,
  ExternalCategory,
  ExternalCategoryPageExternalCategory,
  ExternalItem,
  Item,
  ItemVariant,
  LegoCategory,
  PartPageCategory,
  RebrickableCategory,
  SearchCategory,
  SearchFilter,
  SearchStore,
  UiCategory,
} from '../types'
import { get, getAllFromIndex, getFromIndex, put } from './db'
import STORES from './stores'
import INDICES from './indices'
import { getCategoriesPageCategory, liveObjectCache } from './idb'
import { getCategoryPageParts } from './parts'
import ObjectCache from './ObjectCacheClass'
import { getActiveSearch, getFirstActiveSearch } from './searches'
import { getAllActiveStores } from './storeMethods'
import indices from './indices'
import { BOOLEAN_AS_NUMBER } from './utils'

export const externalPartPriceMap = ref<Map<string, number>>(
  new Map<string, number>()
)

export async function loadExternalPartPrice(
  type: 'Lego' | 'BrickLink' | 'Rebrickable',
  itemId: number
) {
  const cache = liveObjectCache
  const search = await getActiveSearch()
  const price = await cache.getCheapestPrice(
    itemId,
    search.priceScoreQuantity,
    true,
    ''
  )
  if (!price) {
    return
  }
  externalPartPriceMap.value.set(type + itemId, price)
}

export async function getCategories(
  ids: number[]
): Promise<(Category | undefined)[]> {
  return await Promise.all(
    ids.map((id) => {
      return liveObjectCache.getCategory(id)
    })
  )
}

export const excludedCategories = ref<Category[]>([])
export async function getExcludedCategories(): Promise<Category[] | undefined> {
  return excludedCategories.value
}

export async function getExternalCategories(
  db: IDBPDatabase,
  categoryId: number
): Promise<ExternalCategory[] | undefined> {
  return await getAllFromIndex<ExternalCategory>(
    db,
    INDICES.EXTERNAL_CATEGORIES_BY_CATEGORY,
    categoryId
  )
}

export async function getCategoryImage(
  db: IDBPDatabase,
  id: number
): Promise<string | undefined> {
  const externalCategories = await getExternalCategories(db, id)
  if (!externalCategories) {
    return
  }
  for (let i = 0; i < externalCategories.length; i++) {
    const parts = await getAllFromIndex<Item>(
      db,
      INDICES.EXTERNAL_PARTS_BY_CATEGORY,
      id
    )
    if (!parts) {
      continue
    }
    for (let j = 0; j < parts.length; j++) {
      const part = parts[j]
      const variants = await getAllFromIndex<ItemVariant>(
        db,
        INDICES.PART_VARIANTS_BY_PART,
        part.itemId
      )
      if (!variants) {
        continue
      }
      const variant = variants.find((v) => v.image)
      if (variant) {
        return variant.image
      }
    }
  }
}

export async function getExternalCategoryImage(
  db: IDBPDatabase,
  category: ExternalCategory
): Promise<string | undefined> {
  const externalPart = await getFromIndex<ExternalItem>(
    db,
    INDICES.EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY,
    [category.type, category.id]
  )
  if (!externalPart) {
    return
  }
  const variant = await getFromIndex<ItemVariant>(
    db,
    INDICES.PART_VARIANTS_BY_TYPE_AND_PART,
    [externalPart.type, externalPart.externalItemId]
  )
  if (!variant) {
    return
  }
  return variant.image
}

export async function getAllCategories(
  db: IDBPDatabase
): Promise<CachedCategory[]> {
  return await db.getAll(STORES.CATEGORIES.name)
}

export async function getAllExternalCategories(
  db: IDBPDatabase
): Promise<CachedExternalCategory[]> {
  return await db.getAll(STORES.EXTERNAL_CATEGORIES.name)
}

export async function getExternalCategoriesByCategoryId(
  id: number,
  objectCache: ObjectCache
) {
  return await getAllFromIndex(
    objectCache.db,
    INDICES.EXTERNAL_CATEGORIES_BY_CATEGORY,
    id
  )
}

export async function getExternalCategoryPageExternalCategory(
  type: 'BrickLink' | 'Lego' | 'Rebrickable',
  id: string
): Promise<ExternalCategoryPageExternalCategory | undefined> {
  const externalCategory = await liveObjectCache.getExternalCategory(id, type)
  if (!externalCategory) {
    return
  }
  const category = await liveObjectCache.getCategory(
    externalCategory.categoryId
  )
  if (!category) {
    return
  }
  const externalCategories =
    await liveObjectCache.getExternalCategoriesByCategoryId(category.id)
  if (!externalCategories) {
    return
  }
  const externalParts =
    await liveObjectCache.getExternalCategoryPageExternalParts(type, id)
  if (!externalParts) {
    return
  }
  return {
    ...externalCategory,
    category: {
      ...category,
      externalCategories,
    },
    externalParts,
  }
}

export async function getAllActiveCategories(
  db: IDBPDatabase,
  searchId: number
): Promise<Category[] | undefined> {
  const ids = await getAllActiveCategoryIds(db, searchId)
  if (!ids) {
    return
  }
  const categoriesPageCategories: CategoriesPageCategory[] = []
  for (let i = 0; i < 20; i++) {
    const category = await getCategory(db, ids[i])
    if (!category) {
      continue
    }
    const categoriesPageCategory = await getCategoriesPageCategory(category)
    if (
      !categoriesPageCategory ||
      categoriesPageCategory.externalCategories.length === 0
    ) {
      continue
    }
    categoriesPageCategories.push(categoriesPageCategory)
  }
  return categoriesPageCategories
}
export async function getAllActiveCategoryIds(
  db: IDBPDatabase,
  searchId: number
): Promise<number[] | undefined> {
  let categoryIds: number[] = []
  const included = await getAllFromIndex<SearchCategory>(
    db,
    indices.SEARCH_CATEGORIES_EXCLUDED,
    [searchId, BOOLEAN_AS_NUMBER.FALSE]
  )
  if (included && included.length > 0) {
    categoryIds = included.map((ss) => ss.categoryId)
  } else {
    // @ts-ignore
    categoryIds = await db.getAllKeys(STORES.CATEGORIES.name)
  }
  const excluded = await getAllFromIndex<SearchCategory>(
    db,
    indices.SEARCH_CATEGORIES_EXCLUDED,
    [searchId, BOOLEAN_AS_NUMBER.TRUE]
  )

  if (excluded) {
    const excludedIds = excluded.map((ss) => ss.categoryId)
    categoryIds = categoryIds.filter(
      (categoryId) => !excludedIds.includes(categoryId)
    )
  }
  return categoryIds
}

export async function getCategoriesPageCategories2(
  objectCache: ObjectCache
): Promise<CategoriesPageCategory[] | undefined> {
  const search = await getFirstActiveSearch(objectCache)
  if (!search) {
    return
  }
  const categories = await getAllActiveCategories(liveObjectCache.db, search.id)
  if (!categories) {
    return
  }
  const categoriesPageCategories: CategoriesPageCategory[] = []
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    // const numInvItems = await countInvItems(
    //   liveObjectCache.db,
    //   store.id,
    //   search
    // )
    // let fetchPercent =
    //   (100 * numInvItems) /
    //   (store.fetchMaxPageIndex *
    //     (store.type === StoreType.BrickLink ? 100 : 400))
    // if (store.fullyFetched) {
    //   fetchPercent = 100
    // }
    categoriesPageCategories.push({
      ...category,
    })
  }
  return categoriesPageCategories
}

export async function getCategoriesPageCategories(): Promise<
  CategoriesPageCategory[] | undefined
> {
  const objectCache = liveObjectCache
  const categories = await objectCache.getAllCategories()
  if (!categories) {
    return
  }
  const search = await objectCache.getActiveSearch()
  if (!search) {
    return
  }
  const categoriesPageCategories: CategoriesPageCategory[] = []
  for (let i = 0; i < categories.length; i++) {
    const category: Category = categories[i]
    if (search.categories.excluded.includes(category.id)) {
      continue
    }
    if (
      search.categories.included.length > 0 &&
      !search.categories.included.includes(category.id)
    ) {
      continue
    }
    const categoriesPageCategory = await getCategoriesPageCategory(category)
    if (
      !categoriesPageCategory ||
      categoriesPageCategory.externalCategories.length === 0
    ) {
      continue
    }
    categoriesPageCategories.push(categoriesPageCategory)
  }
  return categoriesPageCategories.sort((a, b) => a.id - b.id)
}

export async function getCategoryPageCategory(
  id: number
): Promise<CategoryPageCategory | undefined> {
  const category = await liveObjectCache.getCategory(id)
  if (!category) {
    return
  }
  const externalCategories =
    await liveObjectCache.getExternalCategoriesByCategoryId(id)
  if (!externalCategories) {
    return
  }
  const parts = await getCategoryPageParts(id)
  if (!parts) {
    return
  }
  return {
    ...category,
    parts,
    externalCategories,
  }
}

export async function addCategory(
  db: IDBPDatabase
): Promise<number | undefined> {
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
    type: 'BrickLink',
  }
  await putExternalCategory(db, brickLinkCategory)
}
export async function putExternalCategory(
  db: IDBPDatabase,
  category: ExternalCategory
) {
  return await put(db, STORES.EXTERNAL_CATEGORIES, category)
}
export async function updateCategory(db: IDBPDatabase, category: Category) {
  await put(db, STORES.CATEGORIES, category)
}

export async function getCategory(
  db: IDBPDatabase,
  id: number
): Promise<Category | undefined> {
  return await get(db, STORES.CATEGORIES, id)
}
export async function getExternalCategory<T extends ExternalCategory>(
  db: IDBPDatabase,
  id: string,
  type: 'BrickLink' | 'Lego' | 'Rebrickable'
): Promise<T> {
  return await get(db, STORES.EXTERNAL_CATEGORIES, [type, id])
}
export async function getBrickLinkCategory(
  db: IDBPDatabase,
  id: string
): Promise<BrickLinkCategory> {
  return await getExternalCategory<BrickLinkCategory>(db, id, 'BrickLink')
}
export async function getRebrickableCategory(
  db: IDBPDatabase,
  id: string
): Promise<RebrickableCategory> {
  return await getExternalCategory<RebrickableCategory>(db, id, 'Rebrickable')
}
export async function getLegoCategory(
  db: IDBPDatabase,
  id: string
): Promise<LegoCategory> {
  return await getExternalCategory<LegoCategory>(db, id, 'Lego')
}
export async function getPartPageCategory(
  db: IDBPDatabase,
  id: string
): Promise<PartPageCategory> {
  return await get(db, STORES.CATEGORIES, id)
}
