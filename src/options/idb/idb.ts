import { IDBPDatabase, openDB } from "idb";
import STORES, { StoreDefinition } from './stores'
import INDICES, { IndexDefinition } from './indices'
import { ActiveSearch, ActiveSearchButtonActiveSearch, ActiveSearchPageSearch, AddNewStore, BrickLinkItem, CategoriesPageCategory, Category, CategoryPageCategory, CategoryPagePart, Color, ColorPageColor, ColorPageInvItem, ColorsPageColor, InvItem, Item, ItemVariant, LegoItem, ObjectCache, PartPagePart, PartPageVariant, PartPageVariantInvItem, PartsPagePart, PartsPageVariant, PartsPageVariantInvItem, RbColor, Search, SearchBase, SearchesPageSearch, ShippingCost, ShopListItem, Store, StorePageInvItem, StorePageInvItemItem, StorePagePart, StorePageStore, StoresPageStore, StoreType, UiCategory, UiColor, UiInvItem, UiItem, UiItemVariant, UiSearch, UiShopList, UiStore } from "../types";
import { DB_NAME } from "./constants";
import { toDataURL } from "../utils";
import { getCondition } from "./condition";
import { getBrickLinkPrices } from "./getBrickLinkPrices";
import { getLegoPrices } from "./getLegoPrices";

export const categories = ref<Map<string, UiCategory>>(new Map<string, UiCategory>())
export const colors = ref({})
export const searches = ref<UiSearch[]>([])
export const shopLists = ref<UiShopList[]>([])

export const openSearch = ref<UiSearch | null>(null)
export const openStore = ref<UiStore | null>(null)

async function getPrices() {
  const db = await getDbConnection()
  const blStore: Store = await getBrickLinkFetchStore(db)
  if (blStore) {
    getBrickLinkPrices(db, blStore)
  }
  const legoStore: Store = await getLegoFetchStore(db)
  if (legoStore) {
    getLegoPrices(db, legoStore)
  }
}

export async function getStorePrices(db: IDBPDatabase, store: Store) {
  switch (store.type) {
    case StoreType.Lego:
      getLegoPrices(db, store)
      break
    case StoreType.BrickLink:
    default:
      getBrickLinkPrices(db, store)
      break
  }
}

let stopFetch: boolean = false
export const fetchingStoreInventory = ref(false)
export function stopFetching() {
  fetchingStoreInventory.value = false
  stopFetch = true
}
let fetchPricesInterval: NodeJS.Timeout

export async function startFetching() {
  console.log('startFetching')
  if (fetchingStoreInventory.value) {
    return
  }
  stopFetch = false
  fetchingStoreInventory.value = true
  getPrices()
  fetchPricesInterval = setInterval(() => {
    if (stopFetch && fetchPricesInterval) {
      clearInterval(fetchPricesInterval)
      return
    }
    getPrices()
  }, 30000 + Math.floor(Math.random() * 30000))
}

function partExcluded(part: Item, search: ActiveSearch) {
  const categories = search.categories
  if (
    categories.excluded
  ) {
    if (categories.ids.includes(part.categoryId)) {
      return true
    }
  } else {
    if (
      categories.ids.length > 0 &&
      !categories.ids.includes(part.categoryId)
    ) {
      return true
    }   
  }
  return false
}
export async function getPartsPageParts(): Promise<PartsPagePart[]> {
  const db = await getDbConnection()
  const items: Item[] = await db.getAll(STORES.PARTS.name)
  const activeSearch: ActiveSearch = getActiveSearch()
  const uiItems: PartsPagePart[] = []
  for (let i = 0; i < items.length; i++) {
    const part = items[i]
    if (partExcluded(part, activeSearch)) {
      console.log('excluded')
      continue
    }
    const variants = await getPartsPageVariants(db, part)
    if (variants.length === 0) {
      console.log('no variants')
      continue
    }
    uiItems.push({
      ...part,
      variants,
      category: await getCategory(db, part.categoryId)
    })
  }
  return uiItems
}
export function getActiveSearch(): ActiveSearch {
  let activeSearch: ActiveSearch = {
    categories: {
      ids: [],
      excluded: false
    },
    colors: {
      ids: [],
      excluded: false
    },
    conditions: {
      ids: [],
      excluded: false
    },
    stores: {
      ids: [],
      excluded: false
    },
    parts: {
      ids: [],
      excluded: false
    }
  }
  let storageValue = localStorage.getItem('activeSearch')
  if (storageValue) {
    activeSearch = JSON.parse(storageValue)
  }
  return activeSearch
}
export async function getActiveSearchButtonActiveSearch(): Promise<ActiveSearchButtonActiveSearch> {
  const search = getActiveSearch()
  const activeSearch: ActiveSearchButtonActiveSearch = {
    ...search,
    categories: {
      excluded: search.categories.excluded,
      ids: search.categories.ids,
      objects: await getCategories(search.categories.ids)
    }
  }
  return activeSearch
}

async function getCategories(ids: string[]): Promise<Category[]> {
  const db = await getDbConnection()
  return await Promise.all(ids.map(id => {
     return get(db, STORES.CATEGORIES, id)
  }))
}

export async function getActiveSearchPageSearch(): Promise<ActiveSearchPageSearch> {
  const search: ActiveSearch = await getActiveSearch()
  const activeSearchPageSearch: ActiveSearchPageSearch = {
    ...search,
    conditionObjects: [],
    categoryObjects: [],
    colorObjects: [],
    partObjects: [],
    storeObjects: []
  }
  const db = await getDbConnection()
  for (let i = 0; i < search.categories.ids.length; i++) {
    const id = search.categories.ids[i]
    const category = await getCategory(db, id)
    activeSearchPageSearch.categoryObjects.push(await getCategoriesPageCategory(db, category))
  }
  for (let i = 0; i < search.conditions.ids.length; i++) {
    const id = search.conditions.ids[i]
    const conditionObject = await getCondition(db, id)
    activeSearchPageSearch.conditionObjects.push(conditionObject)
  }
  return activeSearchPageSearch
}
export async function excludeCategory(category: Category) {
  const activeSearch = getActiveSearch()
  activeSearch.categories.excluded = true
  activeSearch.categories.ids.push(category.id)
  storeActiveSearch(activeSearch)
}
export function storeActiveSearch(activeSearch: ActiveSearchButtonActiveSearch) {
  const toStore: ActiveSearch = {
    categories: {
      ids: activeSearch.categories.ids,
      excluded: activeSearch.categories.excluded
    },
    colors: activeSearch.colors,
    parts: activeSearch.parts,
    conditions: activeSearch.conditions,
    stores: activeSearch.stores
  }
  localStorage.setItem('activeSearch', JSON.stringify(toStore))
}

export const excludedCategories = ref<Category[]>([])
export async function getExcludedCategories(): Promise<Category[] | undefined> {
  return excludedCategories.value
}
async function getBrickLinkFetchStore(db: IDBPDatabase): Promise<Store> {
  const stores = await getAllFromIndex(db, INDICES.STORES_BY_LAST_SCRAPED_AND_TYPE, [undefined, StoreType.BrickLink], 1)
  return stores[0]
}

async function getLegoFetchStore(db: IDBPDatabase): Promise<Store> {
  const stores = await getAllFromIndex(db, INDICES.STORES_BY_LAST_SCRAPED_AND_TYPE, [undefined, StoreType.Lego], 1)
  return stores[0]
}

export async function getColor(db: IDBPDatabase, colorId: string): Promise<Color> {
  return await get(db, STORES.COLORS, colorId + '')
}
export async function getPartsInCategory(db: IDBPDatabase, id: string): Promise<UiItem[]> {
  return await getAllFromIndex(db, INDICES.PARTS_BY_CATEGORY, id)
}
export async function getNumPartsInCategory(db: IDBPDatabase, id: string): Promise<number> {
  return await countFromIndex(db, INDICES.PARTS_BY_CATEGORY, id)
}
export async function getFromIndex(
  db: IDBPDatabase,
  index: IndexDefinition,
  query: IDBKeyRange | IDBValidKey
): Promise<any> {
  return db.getFromIndex(index.store, index.name, query)
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
export async function get(db: IDBPDatabase, store: StoreDefinition, query: IDBKeyRange | IDBValidKey) {
  return await db.get(store.name, query)
}

async function getNumInvItemsByPart(db: IDBPDatabase, part: Item): Promise<number> {
  const x = await countFromIndex(db, INDICES.INV_ITEMS_BY_ITEM, part.itemId + '')
  console.log(part, part.itemId, x)
  return await countFromIndex(db, INDICES.INV_ITEMS_BY_ITEM, part.itemId + '')
}

async function getCategoryPagePart(db: IDBPDatabase, part: Item): Promise<CategoryPagePart> {
  const p = await getUiPartFromPart(db, part)
  const numInvItems = await getNumInvItemsByPart(db, part)
  return {
    ...p,
    numInvItems
  }
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
export async function getCategoriesPageCategory(db: IDBPDatabase, category: Category): Promise<CategoriesPageCategory> {
  const numParts = await getNumPartsInCategory(db, category.id)
  const image = await getCategoryImage(db, category.id)
  return {
    ...category,
    numParts,
    image
  }
}
export async function getCategoriesPageCategories(): Promise<CategoriesPageCategory[]> {
  const db = await getDbConnection()
  const categories = await db.getAll(STORES.CATEGORIES.name)
  const categoriesPageCategories: CategoriesPageCategory[] = []
  const activeSearch = getActiveSearch()
  for (let i = 0; i < categories.length; i++) {
    const category: Category = categories[i]
    if (
      activeSearch.categories.excluded
    ) {
      if (activeSearch.categories.ids.includes(category.id)) {
        continue
      }
    } else if (
      activeSearch.categories.ids.length > 0 &&
      !activeSearch.categories.ids.includes(category.id)
    ) {
      continue
    }
    const categoriesPageCategory: CategoriesPageCategory = await getCategoriesPageCategory(db, category)
    categoriesPageCategories.push(categoriesPageCategory)
  }
  return categoriesPageCategories.filter(category => category.numParts > 0).sort((a, b) => Number.parseInt(a.id) - Number.parseInt(b.id))
}
export async function getPart(db: IDBPDatabase, partId: string): Promise<Item> {
  return await get(db, STORES.PARTS, partId)
}
export async function getUiPartVariant(partId: number, colorId: number): Promise<UiItemVariant> {
  const db = await getDbConnection()
  const variant: ItemVariant = await get(db, STORES.PART_VARIANTS, [partId, colorId])
  const invItems: InvItem[] = await getAllFromIndex(
    db,
    INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
    [variant.itemId, variant.colorId]
  )
  console.log(partId, colorId, invItems)
  const uiInvItems: UiInvItem[] = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem: InvItem = invItems[i]
    const store = await get(db, STORES.STORES, invItem.storeId)
    const uiItem: UiItem | undefined = await getUiPart(invItem.itemId + '')
    const color: Color | undefined = await getColor(db, invItem.colorId)
    if (!uiItem || !color) {
      continue
    }
    uiInvItems.push({
      ...invItem,
      store,
      item: uiItem,
      colorName: color.name
    })
  }
  const uiPartVariant: UiItemVariant = {
    ...variant,
    color: await getColor(db, variant.colorId + ''),
    invItems: uiInvItems,
    item: await getUiPart(variant.itemId),
  }
  return uiPartVariant
}
export async function getUiPartVariants(db: IDBPDatabase, id: string, objectCache?: ObjectCache): Promise<UiItemVariant[]> {
  const variants: UiItemVariant[] = await getAllFromIndex(db, INDICES.PART_VARIANTS_BY_PART, id)
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    variant.color = colors.value[variant.colorId]
    variant.invItems = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [variant.itemId, variant.colorId]
    )
  }
  return variants
}
export async function getPartPageVariants(db: IDBPDatabase, id: string, objectCache?: ObjectCache): Promise<PartPageVariant[]> {
  const variants: ItemVariant[] = await getAllFromIndex(db, INDICES.PART_VARIANTS_BY_PART, id)
  console.log('getPartPageVariants', variants, id)
  const partPageVariants: PartPageVariant[] = []
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    console.log(i, variant)
    const partPageVariant = {
      ...variant,
      color: await getColor(db, variant.colorId + ''),
      invItems: await getPartPageVariantInvItems(db, variant)
    }
    partPageVariants.push(partPageVariant)
  }
  return partPageVariants
}
async function getPartPageInvItems(db: IDBPDatabase, itemId: string): Promise<PartPageVariantInvItem[]> {
  const invItems = await getAllFromIndex(
    db,
    INDICES.INV_ITEMS_BY_ITEM,
    itemId + ''
  )
  const partPageInvItems = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem: InvItem = invItems[i]
    const partPageVariantInvItem: PartPageVariantInvItem = {
      ...invItem,
      color: await getColor(db, invItem.colorId + ''),
      store: await getStore(db, invItem.storeId + '')
    }
    partPageInvItems.push(partPageVariantInvItem)
  }
  return partPageInvItems
}
async function getPartPageVariantInvItems(db: IDBPDatabase, variant: ItemVariant): Promise<PartPageVariantInvItem[]> {
  const invItems = await getAllFromIndex(
    db,
    INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
    [variant.itemId + '', variant.colorId + '']
  )
  console.log('getPartPageVariantInvItems', variant.itemId, variant.colorId)
  const partPageVariantInvItems = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem: InvItem = invItems[i]
    const partPageVariantInvItem: PartPageVariantInvItem = {
      ...invItem,
      color: await getColor(db, invItem.colorId + ''),
      store: await getStore(db, invItem.storeId + '')
    }
    partPageVariantInvItems.push(partPageVariantInvItem)
  }
  return partPageVariantInvItems
}
export async function getStorePageInvItems(db: IDBPDatabase, id: string): Promise<StorePageInvItem[]> {
  const search = getActiveSearch()
  const objectCache: ObjectCache = {
    colors: new Map<string, UiColor>,
  }
  const invItems: InvItem[] = await getAllFromIndex(db, INDICES.INV_ITEMS_BY_STORE, id)
  const uiInvItems: StorePageInvItem[] = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem = invItems[i]
    const part: StorePageInvItemItem | undefined = await getStorePagePart(invItem.itemId, objectCache)
    if (!part) {
      continue
    }
    const color = await getColor(db, invItem.colorId)
    const variant = await getFromIndex(db, INDICES.PART_VARIANTS_BY_PART_AND_COLOR, [part.itemId, color.id])
    const uiInvItem: StorePageInvItem = {
      ...invItem,
      item: part,
      colorName: color?.name,
      category: await getCategory(db, part.categoryId),
      variant
    }
    uiInvItems.push(uiInvItem)
  }
  return uiInvItems
}
export async function getUiPart(id: string, objectCache?: ObjectCache): Promise<UiItem | undefined> {
  id = id + ''
  const db = await getDbConnection()
  const part: Item = await get(db, STORES.PARTS, id)
  const uiPart = await getUiPartFromPart(db, part, objectCache)
  return uiPart
}
export async function getStorePagePart(id: string, objectCache?: ObjectCache): Promise<StorePageInvItemItem | undefined> {
  id = id + ''
  const db = await getDbConnection()
  const part: Item = await get(db, STORES.PARTS, id)
  if (!part) {
    console.log('getUiPartFromPart: error, no part', part)
    return
  }
  const variants: ItemVariant[] = await getAllFromIndex(db, INDICES.PART_VARIANTS_BY_PART, part.itemId + '')
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    variant.color = await getColor(db, variant.colorId + '')
    variant.invItems = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [variant.itemId + '', variant.colorId + '']
    )
  }
  return {
    ...part,
    variants,
    category: await getCategory(db, part.categoryId)
  }
}
async function getStore(db: IDBPDatabase, storeId: string): Promise<Store> {
  return await db.get(STORES.STORES.name, storeId + '')
}
export async function getPartPagePart(id: string): Promise<PartPagePart | undefined> {
  const db = await getDbConnection()
  const part: Item = await get(db, STORES.PARTS, id)
  console.log('getPartPagePart', id, part)
  if (!part) {
    return
  }
  const variants: PartPageVariant[] = await getPartPageVariants(db, part.itemId + '')
  const invItems: PartPageVariantInvItem[] = await getPartPageInvItems(db, part.itemId + '')
  return {
    ...part,
    variants,
    invItems,
    category: await getCategory(db, part.categoryId)
  }
}

async function getUiPartFromPart(db: IDBPDatabase, part: Item, objectCache?: ObjectCache): Promise<UiItem | undefined> {
  if (!part) {
    console.log('getUiPartFromPart: error, no part', part)
    return
  }
  const variants: UiItemVariant[] = await getUiPartVariants(db, part.itemId + '', objectCache)
  return {
    ...part,
    variants
  }
}

export async function countFromIndex(db: IDBPDatabase, index: IndexDefinition, query?: string | (string | number)[] | number) {
  return await db.countFromIndex(index.store, index.name, query)
}

export async function countInvItemsWithColor(db: IDBPDatabase, id: string): Promise<number> {
  return await countFromIndex(db, INDICES.INV_ITEMS_BY_COLORS, id)
}

export async function getInvItemsWithColor(db: IDBPDatabase, id: number): Promise<ColorPageInvItem[]> {
  const invItems: InvItem[] = await getAllFromIndex(db, INDICES.INV_ITEMS_BY_COLORS, id)
  const colorPageInvItems: ColorPageInvItem[] = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem = invItems[i]
    const part = await getPart(db, Number.parseInt(invItem.itemId))
    const color = await getColor(db, invItem.colorId)
    const variant: ItemVariant = await getItemVariant(db, invItem.itemId, id)
    colorPageInvItems.push({
      ...invItem,
      item: part,
      colorName: color.name,
      variant
    })
  }
  return colorPageInvItems
}

export async function getUiColor(id: string): Promise<ColorPageColor> {
  const idNumber = Number.parseInt(id)
  const db = await getDbConnection()
  const color: Color = await get(db, STORES.COLORS, idNumber)
  const invItems = await getInvItemsWithColor(db, idNumber)
  const uiColor: ColorPageColor = {
    ...color,
    invItems
  }
  return uiColor
}
export async function getColorPageColor(id: string): Promise<ColorPageColor> {
  id = id + ''
  const db = await getDbConnection()
  const color: Color = await get(db, STORES.COLORS, id)
  const invItems: InvItem[] = await getAllFromIndex(db, INDICES.INV_ITEMS_BY_COLORS, id)
  const colorPageInvItems: ColorPageInvItem[] = []
  for (let i = 0; i < invItems.length; i++) {
    const invItem = invItems[i]
    const part = await getPart(db, invItem.itemId)
    const color = await getColor(db, invItem.colorId)
    const variant: ItemVariant = await getItemVariant(db, invItem.itemId, id)
    const store: Store = await getStore(db, invItem.storeId)
    colorPageInvItems.push({
      ...invItem,
      item: part,
      colorName: color.name,
      variant,
      store
    })
  }
  const uiColor: ColorPageColor = {
    ...color,
    invItems: colorPageInvItems
  }
  return uiColor
}
export async function getColorsPageColors(): Promise<ColorsPageColor[]> {
  const db = await getDbConnection()
  const colors: Color[] = await db.getAll(STORES.COLORS.name)
  const uiColors: ColorsPageColor[] = []
  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    const numInvItems = await countInvItemsWithColor(db, color.id)
    if (numInvItems === 0) {
      continue
    }
    const invItem: ItemVariant = await getFromIndex(db, INDICES.PART_VARIANTS_BY_COLOR, color.id)
    const image = invItem?.image
    uiColors.push({
      ...color,
      numInvItems,
      image
    })
  }
  return uiColors
}
export async function getUiColors(): Promise<UiColor[]> {
  const db = await getDbConnection()
  const colors: Color[] = await db.getAll(STORES.COLORS.name)
  const uiColors: UiColor[] = []
  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    const numInvItems = await countInvItemsWithColor(db, color.id)
    const invItem: ItemVariant = await getFromIndex(db, INDICES.PART_VARIANTS_BY_COLOR, color.id)
    // console.log(invItem, color.id)
    const image = invItem?.image
    uiColors.push({
      ...color,
      numInvItems,
      image
    })
  }
  return uiColors
}
export async function getStorePageStore(id: string): Promise<StorePageStore | undefined> {
  const db = await getDbConnection()
  id = id + ''
  const store: Store = await get(db, STORES.STORES, id)
  if (!store) {
    return
  }
  const invItems: StorePageInvItem[] = await getStorePageInvItems(db, id)
  const uiStore = {
    ...store,
    items: invItems
  }
  return uiStore
}
export async function getDbCreateInitialStores() {
  const db = await getDbConnection()
  return await createInitialStores(db)
}
export async function createInitialStores(db: IDBPDatabase) {
  if (!db) {
    db = await getDbConnection()
  }
  await addStore("Lego Pick a Brick", "lego-pick-a-brick", [
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 1200
    },
    {
      region: 'AT',
      cost: 600,
    },
  ], 'https://www.lego.com/de-at/pick-and-build/pick-a-brick', 100, db, StoreType.Lego)
  await addStore("BrickDom's Brick Shop", "1720918", [
    {
      region: 'AT',
      cost: 4750,
    },
  ], 'BrickDom', 98, db)
  await addStore("Steinemichl", "1801484", [
    {
      region: 'AT',
      cost: 4900,
    },
  ], 'michael06642010', 100, db)
  await addStore("Bunte Steinewelt", "1801484", [
    {
      region: 'AT',
      cost: 2380,
      maxWeight: 26000,
      maxOrderPrice: 99999
    },
  ], 'BunteSteinewelt', 100, db)
  await addStore("bricksbyaj", "1843556", [
    {
      region: 'AT',
      cost: 490,
      maxWeight: 2000,
    },
    {
      region: 'AT',
      cost: 1150,
      maxWeight: 10000,
    },
    {
      region: 'AT',
      cost: 1850,
      maxWeight: 30000,
    },
  ], 'bricksbyaj', 100, db)
  await addStore("Brickturtle", "739435", [
    {
      region: 'AT',
      cost: 430,
      maxWeight: 2000,
    },
    {
      region: 'AT',
      cost: 790,
      maxWeight: 4000,
    },
  ], 'neogap', 100, db)
  await addStore("BRICKMOUSE", "712635", [
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 60000,
    },
    {
      region: 'AT',
      cost: 990,
      maxWeight: 4000,
    },
    {
      region: 'AT',
      cost: 790,
      maxWeight: 2000,
    },
    {
      region: 'AT',
      cost: 650,
      maxWeight: 1000,
    },
    {
      region: 'AT',
      cost: 550,
      maxWeight: 400,
    },
    {
      region: 'AT',
      cost: 450,
      maxWeight: 200,
    },
  ], 'brickmouse', 100, db)
  await addStore("minifigmaestro", "2066952", [
    {
      region: 'AT',
      cost: 495,
      maxWeight: 2000,
    },
  ], 'minifigmaestro', 98, db)
  await addStore("BricksInClicks", "2624933", [
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 6000,
    },
  ], 'DDC26', 100, db)
  await addStore("Unsorted Brick", "2068227", [
    {
      region: 'AT',
      cost: 599,
    },
  ], 'UnsortedBrick', 100, db)
  await addStore("MoccaBriggs", "1850805", [
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 2500,
      type: 'eco'
    },
    {
      region: 'AT',
      cost: 0,
      minOrderPrice: 3000,
      type: 'priority'
    },
  ], 'Mocca Briggs', 100, db)
  await addStore("Die Steinschleuder", "1832236", [], 'KleinerBandit', 100, db)
  await addStore("BunteSteinewelt", "1801484", [
    {
      cost: 1090,
      maxWeight: 750,
      maxOrderPrice: 5000
    },
    {
      cost: 1990,
      maxWeight: 4000,
      maxOrderPrice: 99999
    },
    {
      cost: 2380,
      maxWeight: 26000,
      maxOrderPrice: 99999
    }
  ], 'BunteSteinewelt', 100, db)
  await addStore("Magic Magnus", "52799", [
    {
      cost: 1090,
      maxWeight: 750,
      maxOrderPrice: 15000
    },
    {
      cost: 1990,
      maxWeight: 4000,
      maxOrderPrice: 99999
    },
    {
      cost: 2380,
      maxWeight: 26000,
      maxOrderPrice: 99999
    }
  ], 'MagicMagnus', 100, db)
  await addStore("bricks56218", "996237", [], 'Bricks56218', 100, db)
  await addStore("Bricks_4_everyone", "1962608", [
    {
      minOrderPrice: 500,
      maxWeight: 500,
      cost: 380
    },
    {
      minOrderPrice: 500,
      maxWeight: 3000,
      cost: 450
    },
    {
      minOrderPrice: 500,
      maxWeight: 10000,
      cost: 650
    },
    {
      minOrderPrice: 500,
      maxWeight: 30000,
      cost: 950
    },
    {
      minOrderPrice: 5500,
      cost: 0
    }
  ], 'RWR_Brixx', 99, db)
  await addStore("Bricks Austria", "3112575", [
    {
      region: 'AT',
      cost: 490
    },
    {
      region: 'AT',
      minOrderPrice: 6000,
      cost: 0
    },
  ], 'carinthia_brick', 100, db)
  await addStore("A brick per day...", "709693", [], 'stefxan', 100, db)
}
import rbColors from '../rebrickable-colors.json'
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
import rbParts from '../rbPartMappings.json'
export const rbPartsLegoId = {}
export const rbPartsBrickLinkId = {}
export async function importRbParts() {
  for (let i = 0; i < rbParts.length; i++) {
    const rbPart = rbParts[i]
    let legoPartIds: string[] | undefined
    if (rbPart.external_ids.LEGO) {
      legoPartIds = rbPart.external_ids.LEGO
    }
    let brickLinkIds: string[] | undefined
    if (rbPart.external_ids.BrickLink) {
      brickLinkIds = rbPart.external_ids.BrickLink
    }
    const part: Item = {
      itemId: rbPart.part_num,
      categoryId: rbPart.part_cat_id,
      itemName: rbPart.name,
      legoPartIds,
      brickLinkIds,
    }
    if (legoPartIds) {
      legoPartIds.forEach(legoPartId => {
        rbPartsLegoId[legoPartId] = part
      })
    }
    if (brickLinkIds) {
      brickLinkIds.forEach(brickLinkId => {
        rbPartsBrickLinkId[brickLinkId] = part
      })
    }
  }
}

import rbCategories from '../rbCategories.json'
export async function importRbCategories() {
  const db = await getDbConnection()
  for (let i = 0; i < rbCategories.length; i++) {
    const rbCategory = rbCategories[i]
    const category: Category = {
      id: rbCategory.id + '',
      name: rbCategory.name
    }
    await put(db, STORES.CATEGORIES, category)
  }
}

async function createInitialData(db: IDBPDatabase) {
  console.log('createInitialData')
  await importRbCategories(db)
  await createInitialColors(db)  
  await createInitialStores(db)  
  await addShopListDb("Board games 2024", db)
  
  shopLists.value = []
}

async function addItemNoVariant(
  db: IDBPDatabase,
  categoryId: string,
  itemId: string,
  itemName: string,
) {
  const existingItem = await get(db, STORES.PARTS, itemId)
  let newItem: Item = {
    categoryId,
    itemId,
    itemName,
  }
  if (existingItem) {
    newItem = {
      ...existingItem,
      ...newItem
    }
  }
  await put(db, STORES.PARTS, newItem)
  return newItem
}
export async function addLegoItem(
  categoryId: string,
  colorId: string,
  item: Item,
  legoName: string,
  newThumb1Img: string,
  db: IDBPDatabase
) {
  item.legoName = legoName
  item.categoryId = categoryId
  await put(db, STORES.PARTS, item)

  let variant: ItemVariant = await getItemVariant(db, item.itemId + '', colorId)
  if (!variant) {
    const image: string = await toDataURL('https:' + newThumb1Img)
    variant = {
      itemId: item.itemId + '',
      colorId,
      image
    }
  }
  await db.put(STORES.PART_VARIANTS.name, variant)
}

export async function addItem(
  categoryId: string,
  colorId: number,
  itemId: string | number,
  itemName: string,
  itemNo: string,
  itemSeq: number,
  itemStatus: string,
  itemType: string,
  newThumb1Img: string,
  db: IDBPDatabase
) {
  itemId = itemId + ''
  const newItem = await addItemNoVariant(
    db,
    categoryId,
    itemId,
    itemName,
  )
  let variant: ItemVariant = await getItemVariant(db, itemId, colorId)
  if (!variant) {
    const image: string = await toDataURL('https:' + newThumb1Img)
    variant = {
      itemId,
      colorId,
      image
    }
  }
  await db.put(STORES.PART_VARIANTS.name, variant)
  const uiItem = await getUiPart(itemId)
  if (!uiItem) {
    return
  }
  const uiVariant: UiItemVariant = {
    ...variant,
    color: colors.value[variant.colorId],
    invItems: await getVariantInvItems(db, variant, newItem),
    item: uiItem
  }
  return uiVariant
}

async function storeItem(db: IDBPDatabase, item: Item) {
  await put(db, STORES.PARTS, item)
  if (item.brickLinkIds) {
    for (let i = 0; i < item.brickLinkIds.length; i++) {
      const blItem: BrickLinkItem = {
        brickLinkId: item.brickLinkIds[i],
        name: '',
        partId: item.itemId
      }
      await put(db, STORES.PARTS_BRICK_LINK, blItem)
    }
  }
  if (item.legoPartIds) {
    for (let i = 0; i < item.legoPartIds.length; i++) {
      const legoItem: LegoItem = {
        legoId: item.legoPartIds[i],
        name: '',
        partId: item.itemId
      }
      await put(db, STORES.PARTS_LEGO, legoItem)
    }
  }
}
export async function getBrickLinkItem(db: IDBPDatabase, brickLinkId: string): Promise<BrickLinkItem | undefined> {
  brickLinkId = brickLinkId + ''
  let blItem: BrickLinkItem = await get(db, STORES.PARTS_BRICK_LINK, brickLinkId)
  if (!blItem) {
    const item: Item = rbPartsBrickLinkId[brickLinkId]
    if (item) {
      await storeItem(db, item)
    } else {
      console.log('no item', brickLinkId, item, Object.keys(rbPartsBrickLinkId).includes(brickLinkId))
    }
  }
  blItem = await get(db, STORES.PARTS_BRICK_LINK, brickLinkId)
  if (!blItem) {
    return
  }
  blItem.part = await getPart(db, blItem.partId)
  return blItem
}

export async function getPartByLegoId(db: IDBPDatabase, legoId: string): Promise<Item> {
  legoId = legoId + ''
  let item = await getFromIndex(db, INDICES.PARTS_BY_LEGO_ID, legoId)
  if (!item) {
    item = rbPartsLegoId[legoId]
    if (item) {
      await put(db, STORES.PARTS, item)
    } else {
      console.log('none', item, legoId, Object.keys(rbPartsLegoId))
    }
  }
  return item
}

export async function addBrickLinkItem(
  categoryId: string,
  colorId: string,
  blItem: BrickLinkItem,
  item: Item,
  brickLinkName: string,
  newThumb1Img: string,
  db: IDBPDatabase
) {
  blItem.name = brickLinkName
  await put(db, STORES.PARTS_BRICK_LINK, blItem)
  item.categoryId = categoryId
  await put(db, STORES.PARTS, item)

  let variant: ItemVariant = await getItemVariant(db, item.itemId, colorId)
  if (!variant) {
    const image: string = await toDataURL('https:' + newThumb1Img)
    variant = {
      itemId: item.itemId,
      colorId,
      image
    }
    await put(db, STORES.PART_VARIANTS, variant)
  }
}

export async function getDbConnection(): Promise<IDBPDatabase> {
  let createData = false
  const db = await openDB(DB_NAME, 1, {
    async upgrade(db, oldVersion, newVersion, transaction) {
      Object.keys(STORES).forEach((key) => {
        const store = STORES[key]
        db.createObjectStore(store.name, {
          keyPath: store.keyPath,
          autoIncrement: store.autoIncrement === true
        })
      })
      Object.keys(INDICES).forEach((key) => {
        const index = INDICES[key]
        const store = transaction.objectStore(index.store)
        store.createIndex(index.name, index.keyPath)
      })
      const conditions = ['New', 'Used']
      const store = transaction.objectStore(STORES.INVENTORY_ITEMS.name)
      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i]
        store.createIndex('store_condition_' + condition, ['storeId', 'condition_' + condition])
      }
      createData = true
    }
  })
  if (createData) {
    await createInitialData(db)
  }
  return db
}
export async function addNewStore(store: AddNewStore) {
  const db = await getDbConnection()
  await addStore(store.name, store.sId, [], '', 100, db)
}
export async function addNewSearch(name: string) {
  const db = await getDbConnection()
  await addSearch(name, db)
}

async function addStore(
  name: string,
  sId: string,
  shippingCosts: ShippingCost[],
  slug: string,
  priceAdjustment: number,
  db: IDBPDatabase,
  type: StoreType = StoreType.BrickLink
) {
  const existingStore: Store = await get(db, STORES.STORES, sId)
  const newStore: Store = {
    sId,
    name,
    fetchPageIndex: existingStore?.fetchPageIndex || 1,
    fetchMaxPageIndex: existingStore?.fetchMaxPageIndex || 10,
    priceAdjustment,
    shippingCosts,
    slug,
    lastScraped: new Date(),
    type: type
  }
  db.put(STORES.STORES.name, newStore)
  const newUiStore: UiStore = {
    ...newStore,
    items: []
  }
  return newUiStore
}
export async function updateStore(db: IDBPDatabase, store: Store | UiStore) {
  if (isProxy(store)) {
    store = toRaw(store)
  }
  try {
    const storeObj: Store = {
      sId: store.sId,
      name: store.name,
      fetchPageIndex: store.fetchPageIndex,
      fetchMaxPageIndex: store.fetchMaxPageIndex,
      lastScraped: store.lastScraped,
      priceAdjustment: store.priceAdjustment,
      shippingCosts: store.shippingCosts,
      slug: store.slug,
      type: store.type
    }
    db.put(STORES.STORES.name, storeObj)
  } catch (e) {
    console.log(store, e)
  }
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

export async function itemVariantPageAddToList(item: object) {
  console.log('itemVariantPageAddToList', item)
  const db = await getDbConnection()
  return await addShopListItem(
    item.listId,
    item.itemId,
    item.condition,
    item.minQ,
    item.maxQ,
    item.maxP,
    item.color,
    db
  )
}

async function addShopListItem(
  shopListId: number,
  itemId: string,
  condition: string,
  minQuantity: number,
  maxQuantity: number,
  maxPrice: number,
  colors: string,
  db: IDBPDatabase
) {
  const shopList = shopLists.value.find(list => list.id === shopListId)
  console.log('addShopListItem', shopList, shopListId)
  if (!shopList) {
    return
  }
  const item: ShopListItem = {
    shopListId,
    itemId,
    condition,
    minQuantity,
    maxQuantity,
    maxPrice,
    colors: colors.toString().split(',')
  }
  await db.put(STORES.SHOP_LIST_ITEMS.name, item)
  shopList.items.push(item)
}
export async function addInvItem(
  db: IDBPDatabase,
  invId: string,
  store: Store,
  colorId: string,
  condition: string,
  quantity: number,
  price: number,
  itemId: string,
) {
  itemId = itemId + ''
  const invItem: InvItem = {
    storeId: store.sId,
    invId,
    itemId,
    condition,
    quantity,
    price,
    colorId,
    condition_New: condition === 'New' ? 1 : 0,
    condition_Used: condition === 'Used' ? 1 : 0,
  }
  await db.put(STORES.INVENTORY_ITEMS.name, invItem)
}

async function put(db: IDBPDatabase, storeDef: StoreDefinition, value: any) {
  try {
    await db.put(storeDef.name, value)
  } catch (e) {
    console.log(value, e)
  }
}
export async function addColor(
  db: IDBPDatabase,
  id: string,
  name: string,
  brickLinkId?: string,
  brickLinkName?: string,
  legoId?: string,
  legoName?: string
) {
  const color: Color = {
    id,
    name,
    brickLinkId,
    brickLinkName,
    legoId,
    legoName
  }
  await put(db, STORES.COLORS, color)
  colors.value[id] = color
}

function getIndexPermutations(title: string, ids: IDBValidKey[]) {
  console.log(title, ids)
  const out: string[] = []
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    out.push(title + id)
    if (ids.length > i) {
      const theRest = ids.slice(i + 1)
      // const restPermutations = getIndexPermutations(title, theRest)
      // restPermutations.forEach(p => {
      theRest.forEach(p => {
        out.push(title + id + '_' + title + p)
      })
    }
  }
  return out
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

export async function updateCategory(
  db: IDBPDatabase,
  category: Category
) {
  await put(db, STORES.CATEGORIES, category)
}

export async function updatePart(
  db: IDBPDatabase,
  part: Item
) {
  await db.put(STORES.PARTS.name, part)
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

export async function addNewShopListItem(item) {
  const db = await getDbConnection()
  await addShopListItem(
    item.listId,
    item.itemId,
    item.condition,
    item.minQ,
    item.maxQ,
    item.maxP,
    item.colors,
    db
  )
}

async function getStoreItems(storeId: string) {
  const db = await getDbConnection()
  try {
    const storeItems = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_STORE,
      storeId
    )
    for (let i = 0; i < storeItems.length; i++) {
      const storeItem = storeItems[i]
      storeItem.item = await getUiPart(storeItem.itemId)
      storeItem.colorName = colors.value[storeItem.color].name
    }
    return storeItems
  } catch (e) {
    console.log('error getting store items', e, storeId)
  }

  return []
}

export async function loadModels() {
  const db = await getDbConnection()
  await loadCategories(db)
  await loadColors(db)
  await loadShopLists()
  await loadSearches()
}
export async function getItemVariant(
  db: IDBPDatabase,
  itemId: string,
  colorId: string
) {
  console.log('getItemVariant', itemId, colorId)
  return await get(db, STORES.PART_VARIANTS, [itemId, colorId])
}

export async function getStoresPageStores(): Promise<StoresPageStore[]> {
  const db = await getDbConnection()
  const search = await getActiveSearch()
  const stores = await db.getAll(STORES.STORES.name)
  const uiStores: StoresPageStore[] = []
  for (let i = 0; i < stores.length; i++) {
    const store = stores[i]
    uiStores.push({
      ...store,
      numInvItems: await countInvItems(db, store.sId, search)
    })
  }
  return uiStores
}

async function countInvItems(db: IDBPDatabase, storeId: string, search: SearchBase): Promise<number> {
  const conditions = search.conditions
  if (conditions.ids.length > 0) {
    const sortedIds = conditions.ids
      .map(x => 'condition_' + x)
      .sort((a, b) => a > b ? 1 : -1)
    const values = sortedIds.map(() => conditions.excluded ? 0 : 1)
    const indexName = sortedIds.join('_')
    const index: IndexDefinition = {
      keyPath: ['storeId', ...sortedIds],
      name: 'store_' + indexName,
      store: STORES.INVENTORY_ITEMS.name
    }
    console.log('count', db, index, storeId, values)
    return await countFromIndex(db, index, [storeId, ...values])
  }
  return await countFromIndex(db, INDICES.INV_ITEMS_BY_STORE, storeId)
}

async function getVariantInvItems(db: IDBPDatabase, variant: ItemVariant, item: Item): Promise<UiInvItem[]> {
  const search = getActiveSearch()
  const conditions = search.conditions
  const uiInvItems: UiInvItem[] = []
  try {
    const storeItems: InvItem[] = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [item.itemId, variant.colorId]
    )
    for (let i = 0; i < storeItems.length; i++) {
      const storeItem = storeItems[i]
      if (conditions.excluded) {
        if (conditions.ids.includes(storeItem.condition)) {
          continue
        }
      } else {
        if (conditions.ids.length > 0 && !conditions.ids.includes(storeItem.condition)) {
          continue
        }
      }
      const color = await getColor(db, variant.colorId)
      if (!color) {
        continue
      }
      const colorName = color.name
      uiInvItems.push({
        ...storeItem,
        item,
        colorName
      })
    }
    return storeItems
  } catch (e) {
    console.log('error getting variant inventory items', e, variant)
  }

  return []
}

async function getPartsPageVariantInvItems(db: IDBPDatabase, variant: ItemVariant): Promise<PartsPageVariantInvItem[]> {
  const search = getActiveSearch()
  const conditions = search.conditions
  const uiInvItems: PartsPageVariantInvItem[] = []
  try {
    const storeItems: InvItem[] = await getAllFromIndex(
      db,
      INDICES.INV_ITEMS_BY_ITEM_AND_COLOR,
      [variant.itemId, variant.colorId]
    )
    for (let i = 0; i < storeItems.length; i++) {
      const storeItem = storeItems[i]
      if (conditions.excluded) {
        if (conditions.ids.includes(storeItem.condition)) {
          continue
        }
      } else {
        if (conditions.ids.length > 0 && !conditions.ids.includes(storeItem.condition)) {
          continue
        }
      }
      const color = await getColor(db, variant.colorId)
      if (!color) {
        continue
      }
      uiInvItems.push({
        ...storeItem,
      })
    }
    return uiInvItems
  } catch (e) {
    console.log('error getting variant inventory items', e, variant)
  }
  return []
}

export async function loadSearches() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.SEARCHES.name)
  for (let i = 0; i < x.length; i++) {
    const search = x[i]
    const uiSearch = {
      ...search,
      stores: []
    }
    if (search.shoppingListId) {
      uiSearch.shoppingList = shopLists.value.find(list => list.id === search.shoppingListId)
    }
    for (let j = 0; j < search.storeIds.length; j++) {
      const storeId = search.storeIds[j]
      uiSearch.stores.push(stores.value.find(store => store.sId === storeId))
    }
    searches.value.push(uiSearch)
  }
}

export async function loadColors(db: IDBPDatabase) {
  const x = await db.getAll(STORES.COLORS.name)
  for (let i = 0; i < x.length; i++) {
    colors.value[x[i].id] = x[i]
  }
}

export async function loadCategories(db: IDBPDatabase) {
  const x = await db.getAll(STORES.CATEGORIES.name)
  for (let i = 0; i < x.length; i++) {
    const category: Category = x[i]
    addUiCategory(db, category)
  }
}

const partDetails = []
let partDetailsScrapePage = 1
let partScrapingInterval
let stopPartScraping = false
let partDetailsMaxPage = 100
export function stopPartScrapingFn() {
  stopPartScraping = true
}
export async function startPartScraping() {
  scrapePartDetails()
  partScrapingInterval = setInterval(() => {
    if (stopPartScraping || partDetailsScrapePage > partDetailsMaxPage) {
      clearInterval(partScrapingInterval)
      return
    }
    scrapePartDetails()
  }, 30000)
}
async function scrapePartDetails() {
  const response = await fetch(`https://rebrickable.com/api/v3/lego/parts/?inc_part_details=1&inc_color_details=0&page_size=1000&page=${partDetailsScrapePage}&key=ec4ddb3b958aaa4edf379059e5f87d2e`, {
    "headers": {
      "accept": "application/json",
      "accept-language": "en,de;q=0.9,es;q=0.8,en-US;q=0.7",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "omit"
  });
    partDetailsScrapePage++
    const json = await response.json()
    partDetailsMaxPage = Math.ceil(json.count / 1000) + 1
  partDetails.push(...json.results)
  console.log(partDetails)
}
export async function loadShopLists() {
  const db = await getDbConnection()
  const x = await db.getAll(STORES.SHOP_LISTS.name)
  for (let i = 0; i < x.length; i++) {
    const list = x[i]
    list.items = await loadShopListItems(db, list.id)
    shopLists.value.push(list)
  }
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

export async function getCategory(db: IDBPDatabase, id: string): Promise<Category> {
  return await get(db, STORES.CATEGORIES, id)
}

async function loadItemVariants(db: IDBPDatabase, item: Item) {
  try {
    const variants = await getAllFromIndex(
      db,
      INDICES.PART_VARIANTS_BY_PART,
      item.itemId
    )
    const itemVariants = []
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      const invItems = await getVariantInvItems(db, variant, item)
      if (invItems.length === 0) {
        continue
      }
      itemVariants.push({
        ...variant,
        item,
        color: colors.value[variant.colorId],
        invItems
      })
    }
    return itemVariants
  } catch (e) {
    console.log('error getting store items', e, item.itemId)
  }
  return []
}

async function getPartsPageVariants(db: IDBPDatabase, item: Item): Promise<PartsPageVariant[]> {
  try {
    const variants: ItemVariant[] = await getAllFromIndex(
      db,
      INDICES.PART_VARIANTS_BY_PART,
      item.itemId
    )
    const partsPageVariants: PartsPageVariant[] = []
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      const invItems = await getPartsPageVariantInvItems(db, variant)
      console.log(i, variant, invItems)
      if (invItems.length === 0) {
        continue
      }
      partsPageVariants.push({
        ...variant,
        item,
        color: await getColor(db, variant.colorId),
        invItems
      })
    }
    return partsPageVariants
  } catch (e) {
    console.log('error getting store items', e, item.itemId)
  }
  return []
}

async function getAllFromIndex(db: IDBPDatabase, index: IndexDefinition, query?: string | (string | number | undefined)[] | number, count?: number) {
  return db.getAllFromIndex(index.store, index.name, query, count)
}

async function loadShopListItems(db: IDBPDatabase, shopListId: string) {
  try {
    const shopListItems = await getAllFromIndex(
      db,
      INDICES.SHOP_LIST_ITEMS_BY_SHOP_LIST,
      shopListId
    )
    for (let i = 0; i < shopListItems.length; i++) {
      const shopListItem = shopListItems[i]
      shopListItem.item = items.value.find(item => item.itemId === shopListItem.itemId)
      shopListItem.colorNames = shopListItem.colors.map(colorId => colors.value[colorId])
    }
    return shopListItems
  } catch (e) {
    console.log('error getting shop list items', e, shopListId)
  }
  return []
}

export async function addShopList(name: string) {
  const db = await getDbConnection()
  return await addShopListDb(name, db)
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
  openSearch.value.shoppingList = shopLists.value?.find(list => list.id === listId)
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
async function addShopListDb(name: string, db: IDBPDatabase) {
  const id = await db.put(STORES.SHOP_LISTS.name, { name })
  if (!id) {
    return
  }
  const list: UiShopList = {
    id: Number(id),
    name,
    items: []
  }
  shopLists.value.push(list)
}
