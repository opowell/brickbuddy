import { IDBPDatabase } from 'idb'
import {
  ActiveSearch,
  CartItem,
  CartWithItems,
  CategoriesPageCategory,
  Category,
  Color,
  ExternalCategory,
  ExternalCategoryPageExternalPart,
  ExternalItem,
  ExternalPartPageExternalPart,
  ExternalPartPageInvItem,
  ExternalPartPageItemVariant,
  HomeData,
  InvItem,
  Item,
  ItemVariant,
  PartPageCategory,
  Search,
  SearchFilter,
  Store,
  StoreCountry,
  StorePageInvItemItem,
  UiColor,
} from '../types'
import STORES from './stores'
import { getFirstActiveCart, getCartItems, getCartQuantity } from './carts'
import {
  getExternalCategoriesByCategoryId,
  getCategoriesPageCategories,
  getCategoriesPageCategories2,
  getCategory,
  getExternalCategory,
  getPartPageCategory,
  loadExternalPartPrice,
} from './categories'
import { getInvItemFromId } from './invItems'
import { getPart, getStorePageExternalPart, getStorePagePart } from './parts'
import { getFirstActiveSearch, getSearchFilters } from './searches'
import {
  count,
  countFromIndex,
  get,
  getAll,
  getAllFromIndex,
  getFromIndex,
} from './db'
import indices from './indices'
import { cheapestPrice, reportTime, startTimer } from '../utils'
import { liveObjectCache } from './idb'
import ComputedObjectCacheClass from './ComputedObjectCacheClass'
import { getAllActiveStoreIds } from './storeMethods'
import { BOOLEAN_AS_NUMBER } from './utils'

export default class ObjectCache {
  allCategories: Category[] | undefined
  allStoreCountries: StoreCountry[] | undefined
  colors: Map<string, UiColor>
  categories: Map<number, Category>
  storeCountries: Map<string, StoreCountry>
  categoriesPageCategories: Map<string, CategoriesPageCategory>
  cheapestPrices: Map<string, number>
  externalCategories: Map<string, ExternalCategory>
  externalCategoriesByCategoryId: Map<string, ExternalCategory[]>
  externalParts: Map<string, ExternalItem>
  externalPartsByPart: Map<number, ExternalItem[]>
  externalPartsByExternalCategory: Map<string, ExternalItem[]>
  partPageCategories: Map<string, Category>
  parts: Map<string, Item>
  storePageExternalParts: Map<string, StorePageInvItemItem>
  numInvItemsByPart: Map<string, number>
  cartItemsByCart: Map<number, CartItem[]>
  numVariantsByPart: Map<string, number>
  variantsByPart: Map<string, ItemVariant[]>
  invItemsByPart: Map<string, InvItem[]>
  invItemsByStore: Map<string, InvItem[]>
  stores: Map<string, Store>
  activeCart: CartWithItems | undefined
  activeSearch: ActiveSearch | undefined
  activeSearchRef: Ref<ActiveSearch | undefined>
  partVariantsByPartColor: Map<string, ItemVariant[]>
  partVariantByPartColor: Map<string, ItemVariant>
  firstVariantByPart: Map<string, ItemVariant>
  invItemsByExternalPartColor: Map<string, InvItem[]>
  invItems: Map<string, InvItem>
  db: IDBPDatabase
  // computedCache: ComputedObjectCacheClass
  constructor(db: IDBPDatabase) {
    this.db = db
    this.activeSearchRef = ref()
    this.partVariantsByPartColor = new Map<string, ItemVariant[]>()
    this.cheapestPrices = new Map<string, number>()
    this.partVariantByPartColor = new Map<string, ItemVariant>()
    this.firstVariantByPart = new Map<string, ItemVariant>()
    this.cartItemsByCart = new Map<number, CartItem[]>()
    this.numInvItemsByPart = new Map<string, number>()
    this.numVariantsByPart = new Map<string, number>()
    this.variantsByPart = new Map<string, ItemVariant[]>()
    this.invItemsByPart = new Map<string, InvItem[]>()
    this.invItemsByExternalPartColor = new Map<string, InvItem[]>()
    this.externalPartsByPart = new Map<number, ExternalItem[]>()
    this.externalParts = new Map<string, ExternalItem>()
    this.externalPartsByExternalCategory = new Map<string, ExternalItem[]>()
    this.colors = new Map<string, UiColor>()
    this.categories = new Map<number, Category>()
    this.storeCountries = new Map<string, StoreCountry>()
    this.categoriesPageCategories = new Map<string, CategoriesPageCategory>()
    this.externalCategoriesByCategoryId = new Map<string, ExternalCategory[]>()
    this.externalCategories = new Map<string, ExternalCategory>()
    this.partPageCategories = new Map<string, Category>()
    this.parts = new Map<string, Item>()
    this.storePageExternalParts = new Map<string, StorePageInvItemItem>()
    this.invItems = new Map<string, InvItem>()
    this.invItemsByStore = new Map<string, InvItem[]>()
    this.stores = new Map<string, Store>()
    this.activeCart = undefined
    // this.computedCache = new ComputedObjectCacheClass(this)
  }
  async getStoreCountries() {
    if (!this.allStoreCountries) {
      this.allStoreCountries = await getAll<StoreCountry>(
        this.db,
        STORES.STORE_COUNTRIES
      )
      if (!this.allStoreCountries) {
        return
      }
      this.allStoreCountries.forEach((c) => {
        this.storeCountries.set(c.id, c)
      })
    }
    return this.allStoreCountries
  }
  async getAllCategories() {
    if (!this.allCategories) {
      this.allCategories = await getAll(this.db, STORES.CATEGORIES)
      if (!this.allCategories) {
        return
      }
      this.allCategories.forEach((c) => {
        this.categories.set(c.id, c)
      })
    }
    return this.allCategories
  }
  async getHomePageNumStores(): Promise<number | undefined> {
    const search = await this.getActiveSearch()
    if (!search) {
      return
    }
    const ids = await getAllActiveStoreIds(this.db, search.id)
    if (!ids) {
      return
    }
    return ids.length
  }
  async getHomePageNumStoreCountries(): Promise<number | undefined> {
    return await count(this.db, STORES.STORE_COUNTRIES)
  }
  async getHomePageNumObjects(
    filterKey: 'colors' | 'categories' | 'stores' | 'parts',
    getObject: Function,
    getObjectKey: Function,
    getAllKeys: Function,
    filter?: Function
  ): Promise<number | undefined> {
    const search = await this.getActiveSearch()
    if (!search) {
      return
    }
    let keys = []
    const included = search[filterKey].included
    if (included && included.length > 0) {
      for (let i = 0; i < included.length; i++) {
        const object = await getObject(included[i])
        if (!object) {
          continue
        }
        keys.push(getObjectKey(object))
      }
    } else {
      // @ts-ignore
      const excluded: T[] = search[filterKey].excluded
      keys = await getAllKeys.bind(this)()
      keys = keys.filter((key: string | number) => !excluded.includes(key))
    }
    if (filter) {
      const filteredKeys = []
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (await filter(key)) {
          filteredKeys.push(key)
        }
      }
    }
    return keys.length
  }
  async getHomePageNumColors(): Promise<number | undefined> {
    const x = this.getHomePageNumObjects(
      'colors',
      this.getColor,
      (color: Color) => color.id,
      this.getAllColorKeys
    )
    return x
  }
  async getHomePageNumParts(): Promise<number | undefined> {
    const x = await this.getHomePageNumObjects(
      'parts',
      this.getPart,
      (part: Item) => part.itemId,
      this.getAllPartKeys,
      async (key) => {
        const externalParts = await this.getExternalPartsByPart(key)
        if (!externalParts) {
          return false
        }
        for (let i = 0; i < externalParts.length; i++) {
          const externalPart = externalParts[i]
          const externalCategory = await this.getExternalCategory(
            externalPart.externalCategoryId,
            externalPart.type
          )
          //
        }
        return true
      }
    )
    return x
  }
  async getHomePageNumCategories(): Promise<number | undefined> {
    const x = await this.getHomePageNumObjects(
      'categories',
      this.getCategory,
      (category: Category) => category.id,
      this.getAllCategoryKeys
    )
    return x
  }
  async getAllStoreKeys(): Promise<string[]> {
    // @ts-ignore
    return this.db.getAllKeys(STORES.STORES.name)
  }
  async getAllPartKeys(): Promise<string[]> {
    // @ts-ignore
    return this.db.getAllKeys(STORES.PARTS.name)
  }
  async getAllCategoryKeys(): Promise<string[]> {
    // @ts-ignore
    return this.db.getAllKeys(STORES.CATEGORIES.name)
  }
  async getAllColorKeys(): Promise<string[]> {
    // @ts-ignore
    return this.db.getAllKeys(STORES.COLORS.name)
  }
  async getAllActiveCategories() {
    this.allCategories = await getAll(this.db, STORES.CATEGORIES)
    if (!this.allCategories) {
      return
    }
    this.allCategories.forEach((c) => {
      this.categories.set(c.id, c)
    })
    return this.allCategories
  }
  async getCheapestPrice(
    itemId: number,
    targetQ: number,
    ignoreColor: boolean,
    colorId: string
  ) {
    const id = itemId + '-' + targetQ + '-' + ignoreColor + '-' + colorId
    if (this.cheapestPrices.has(id)) {
      return this.cheapestPrices.get(id)
    }
    const matchingParts = await this.getExternalPartsByPart(itemId)
    if (!matchingParts) {
      return
    }
    const search = await this.getActiveSearch()
    if (!search) {
      return
    }
    const allMatchingInvItems = new Map<string, InvItem>()
    for (let i = 0; i < matchingParts.length; i++) {
      const matchingPart = matchingParts[i]
      let matches: InvItem[] = []
      const storeIds = await getAllActiveStoreIds(this.db, search.id)
      if (!storeIds) {
        return
      }
      for (let i = 0; i < storeIds.length; i++) {
        const storeId = storeIds[i]
        if (ignoreColor) {
          const invItems = await getAllFromIndex<InvItem>(
            this.db,
            indices.INV_ITEMS_BY_STORE_ITEM,
            [storeId, matchingPart.externalItemId]
          )
          if (!invItems) {
            continue
          }
          matches.push(...invItems)
        } else {
          const invItems = await getAllFromIndex<InvItem>(
            this.db,
            indices.INV_ITEMS_BY_ITEM_AND_COLOR,
            [matchingPart.externalItemId, colorId]
          )
          if (!invItems) {
            return
          }
          matches = invItems
        }
      }
      if (!matches) {
        continue
      }
      matches.forEach((match) =>
        allMatchingInvItems.set(match.storeId + '//' + match.invId, match)
      )
    }
    const price = cheapestPrice(
      Array.from(allMatchingInvItems.values()),
      targetQ,
      true
    )
    this.cheapestPrices.set(id, price)
    return price
  }
  async getFirstVariantByPart(
    itemId: string
  ): Promise<ItemVariant | undefined> {
    if (this.firstVariantByPart.has(itemId)) {
      return this.firstVariantByPart.get(itemId)
    }
    const variant = await getFromIndex<ItemVariant>(
      this.db,
      indices.PART_VARIANTS_BY_PART,
      itemId
    )
    if (!variant) {
      return
    }
    this.firstVariantByPart.set(itemId, variant)
    return variant
  }
  async getPartVariantsByPartColor(itemId: string, colorId: string) {
    const id = itemId + colorId
    if (this.partVariantsByPartColor.has(id)) {
      return this.partVariantsByPartColor.get(id)
    }
    const variants = await getAllFromIndex<ItemVariant>(
      this.db,
      indices.PART_VARIANTS_BY_PART_AND_COLOR,
      [itemId, colorId]
    )
    if (!variants) {
      return
    }
    this.partVariantsByPartColor.set(id, variants)
    return variants
  }
  async getPartVariantByPartColor(itemId: string, colorId: string) {
    const id = itemId + colorId
    if (this.partVariantByPartColor.has(id)) {
      return this.partVariantByPartColor.get(id)
    }
    const variant = await getFromIndex<ItemVariant>(
      this.db,
      indices.PART_VARIANTS_BY_PART_AND_COLOR,
      [itemId, colorId]
    )
    if (!variant) {
      return
    }
    this.partVariantByPartColor.set(id, variant)
    return variant
  }
  async getExternalPartsByPart(
    id: number
  ): Promise<ExternalItem[] | undefined> {
    if (this.externalPartsByPart.has(id)) {
      return this.externalPartsByPart.get(id)
    }
    const externalItems = await getAllFromIndex<ExternalItem>(
      this.db,
      indices.EXTERNAL_PARTS_BY_PART,
      id
    )
    if (!externalItems) {
      return
    }
    this.externalPartsByPart.set(id, externalItems)
    return externalItems
  }
  async getAllObjects<T>(
    map: Map<string | number, T>,
    getter: Function,
    idMapper: Function = (value: T) => value.id
  ): Promise<T[]> {
    if (map.size === 0) {
      const values = await getter()
      values.forEach((value: T) => {
        map.set(idMapper(value), value)
      })
    }
    return Array.from(map.values())
  }
  async getObject<T>(
    map: Map<string | number, T>,
    id: string | number,
    getter: Function
  ): Promise<T | undefined> {
    let object: T | undefined = map.get(id)
    if (!object) {
      object = await getter()
      if (!object) {
        return
      }
      map.set(id, object)
    }
    return object
  }
  async getActiveCart(): Promise<CartWithItems | undefined> {
    if (!this.activeCart) {
      let cart = await getFirstActiveCart(this.db)
      if (!cart) {
        const newCart = {
          active: 1,
          name: new Date().toISOString(),
        }
        cart = {
          ...newCart,
          // @ts-ignore guaranteed to be number
          id: await this.db.put(STORES.CARTS.name, newCart),
        }
      }
      if (!cart) {
        return
      }
      const cartItems = await getCartItems(cart)
      if (!cartItems) {
        return
      }
      this.activeCart = {
        ...cart,
        cartItems,
      }
    }
    return this.activeCart
  }
  async getActiveSearch(): Promise<ActiveSearch> {
    if (!this.activeSearch) {
      let search = await getFirstActiveSearch(this)
      if (!search) {
        const newSearch: Search = {
          id: 0,
          active: 1,
          name: new Date().toISOString(),
          filters: [],
          priceScoreQuantity: 100,
          priceScoreIgnoreColor: true,
        }
        search = {
          ...newSearch,
          id: await this.db.put(STORES.SEARCHES.name, newSearch),
          categories: {
            included: [],
            excluded: [],
          },
          colors: {
            included: [],
            excluded: [],
          },
          conditions: {
            included: [],
            excluded: [],
          },
          stores: {
            included: [],
            excluded: [],
          },
          parts: {
            included: [],
            excluded: [],
          },
        }
      }
      this.activeSearch = search
      this.activeSearchRef.value = search
    }
    return this.activeSearch
  }
  async getInvItem(storeId: string, invItemId: string) {
    return this.getObject(
      this.invItems,
      storeId + '//' + invItemId,
      async () => await getInvItemFromId(this.db, storeId, invItemId)
    )
  }
  async getStore(storeId: string) {
    return this.getObject(
      this.stores,
      storeId,
      async () => await get(this.db, STORES.STORES, storeId)
    )
  }
  async getColor(colorId: string): Promise<Color | undefined> {
    const computedColor = this.computedCache?.colorsMap.value.get(colorId)
    if (computedColor) {
      return computedColor
    }
    return this.getObject(
      this.colors,
      colorId,
      async () => await get<Color>(this.db, STORES.COLORS, colorId)
    )
  }
  async getCategory(categoryId: number): Promise<Category | undefined> {
    return this.getObject<Category | undefined>(
      this.categories,
      categoryId,
      async () => await getCategory(this.db, categoryId)
    )
  }
  async getPart(itemId: number): Promise<Item | undefined> {
    return this.getObject<Item | undefined>(
      this.parts,
      itemId,
      async () => await getPart(this.db, itemId)
    )
  }
  async getExternalCategory(
    categoryId: string,
    type: 'BrickLink' | 'Lego' | 'Rebrickable'
  ): Promise<ExternalCategory | undefined> {
    return this.getObject<ExternalCategory | undefined>(
      this.externalCategories,
      categoryId,
      async () => await getExternalCategory(this.db, categoryId, type)
    )
  }
  async getPartPageCategory(
    categoryId: string
  ): Promise<PartPageCategory | undefined> {
    return this.getObject<PartPageCategory | undefined>(
      this.partPageCategories,
      categoryId,
      async () => await getPartPageCategory(this.db, categoryId)
    )
  }
  async getStorePagePart(partId: string): Promise<Item | undefined> {
    return this.getObject<Item | undefined>(
      this.parts,
      partId,
      async () => await getStorePagePart(partId, this)
    )
  }
  async getCartItems(cartId: number): Promise<CartItem[] | undefined> {
    return this.getObject<CartItem[] | undefined>(
      this.cartItemsByCart,
      cartId,
      async () => getAllFromIndex(this.db, indices.CART_ITEMS_BY_CART, cartId)
    )
  }
  async getInvItemsByExternalPartColor(
    type: 'Rebrickable' | 'Lego' | 'BrickLink',
    externalItemId: string,
    colorId: string
  ): Promise<InvItem[] | undefined> {
    return this.getObject<InvItem[] | undefined>(
      this.invItemsByExternalPartColor,
      type + '-' + externalItemId + '-' + colorId,
      async () =>
        await getAllFromIndex(this.db, indices.INV_ITEMS_BY_ITEM_AND_COLOR, [
          externalItemId,
          colorId,
        ])
    )
  }
  async getStorePageExternalPart(
    invItem: InvItem,
    type: 'BrickLink' | 'Lego'
  ): Promise<StorePageInvItemItem | undefined> {
    return this.getObject<StorePageInvItemItem | undefined>(
      this.storePageExternalParts,
      invItem.itemId,
      async () => await getStorePageExternalPart(invItem, type, this)
    )
  }
  async getExternalPart(
    type: 'BrickLink' | 'Lego',
    externalItemId: string
  ): Promise<ExternalItem | undefined> {
    return this.getObject<ExternalItem | undefined>(
      this.externalParts,
      type + externalItemId,
      async () =>
        await get(this.db, STORES.EXTERNAL_PARTS, [type, externalItemId])
    )
  }
  async getInvItemsByStore(storeId: string): Promise<InvItem[] | undefined> {
    console.log('get', storeId)
    return this.getObject<InvItem[] | undefined>(
      this.invItemsByStore,
      storeId,
      async () =>
        await getAllFromIndex(this.db, indices.INV_ITEMS_BY_STORE, storeId)
    )
  }
  async getCategoriesPageCategories(): Promise<CategoriesPageCategory[]> {
    console.log('getCategoriesPageCategories')
    return this.getAllObjects<CategoriesPageCategory>(
      this.categoriesPageCategories,
      async () => await getCategoriesPageCategories()
    )
  }
  async getCategoriesPageCategories2(): Promise<
    CategoriesPageCategory[] | undefined
  > {
    return await getCategoriesPageCategories2(this)
  }
  async getExternalCategoriesByCategoryId(
    id: number
  ): Promise<ExternalCategory[] | undefined> {
    return this.getObject<ExternalCategory[]>(
      this.externalCategoriesByCategoryId,
      id,
      async () => await getExternalCategoriesByCategoryId(id, this)
    )
  }
  async getNumInvItemsByPart(
    externalItemId: string,
    type: 'Lego' | 'BrickLink' | 'Rebrickable'
  ): Promise<number | undefined> {
    const id = externalItemId + type
    if (this.numInvItemsByPart.has(id)) {
      return this.numInvItemsByPart.get(id)
    }
    const num = await countFromIndex(
      this.db,
      indices.INV_ITEMS_BY_TYPE_AND_ITEM,
      [type, externalItemId]
    )
    this.numInvItemsByPart.set(id, num)
    return num
  }
  async getVariantsByExternalPart(
    externalItemId: string,
    type: 'Lego' | 'BrickLink' | 'Rebrickable'
  ): Promise<ItemVariant[] | undefined> {
    const id = externalItemId + type
    if (this.variantsByPart.has(id)) {
      return this.variantsByPart.get(id)
    }
    const variants = await getAllFromIndex<ItemVariant>(
      this.db,
      indices.PART_VARIANTS_BY_TYPE_AND_PART,
      [type, externalItemId]
    )
    if (!variants) {
      return
    }
    this.variantsByPart.set(id, variants)
    return variants
  }
  async getInvItemsByExternalPart(
    externalItemId: string,
    type: 'Lego' | 'BrickLink' | 'Rebrickable'
  ): Promise<InvItem[] | undefined> {
    const id = externalItemId + type
    if (this.invItemsByPart.has(id)) {
      return this.invItemsByPart.get(id)
    }
    const search = await this.getActiveSearch()
    if (!search) {
      return
    }
    const storeIds = await getAllActiveStoreIds(this.db, search.id)
    if (!storeIds) {
      return
    }
    const invItems = []
    for (let i = 0; i < storeIds.length; i++) {
      const storeId = storeIds[i]
      const storeItems = await getAllFromIndex<InvItem>(
        this.db,
        indices.INV_ITEMS_BY_TYPE_STORE_ITEM,
        [type, storeId, externalItemId]
      )
      if (!storeItems) {
        continue
      }
      invItems.push(...storeItems)
    }
    this.invItemsByPart.set(id, invItems)
    return invItems
  }
  async getNumVariantsByPart(
    externalItemId: string,
    type: 'Lego' | 'BrickLink' | 'Rebrickable'
  ): Promise<number | undefined> {
    const id = externalItemId + type
    if (this.numVariantsByPart.has(id)) {
      return this.numVariantsByPart.get(id)
    }
    const num = await countFromIndex(
      this.db,
      indices.PART_VARIANTS_BY_TYPE_AND_PART,
      [type, externalItemId]
    )
    this.numVariantsByPart.set(id, num)
    return num
  }
  async getExternalPartPageExternalPart(
    type: 'Lego' | 'BrickLink',
    externalItemId: string
  ): Promise<ExternalPartPageExternalPart | undefined> {
    const cart = await this.getActiveCart()
    if (!cart) {
      return
    }
    const externalPart = await this.getExternalPart(type, externalItemId)
    if (!externalPart) {
      return
    }
    const variants = await this.getVariantsByExternalPart(externalItemId, type)
    if (!variants) {
      return
    }
    const eppvs: ExternalPartPageItemVariant[] = []
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      const color = await this.getColor(variant.colorId)
      if (!color) {
        continue
      }
      eppvs.push({
        ...variant,
        color,
      })
    }
    const invItems = await this.getInvItemsByExternalPart(externalItemId, type)
    if (!invItems) {
      return
    }
    const eppiis: ExternalPartPageInvItem[] = []
    for (let i = 0; i < invItems.length; i++) {
      const invItem = invItems[i]
      const color = await this.getColor(invItem.colorId)
      if (!color) {
        continue
      }
      const store = await this.getStore(invItem.storeId)
      if (!store) {
        continue
      }
      const cartQuantity = getCartQuantity(cart, invItem)
      eppiis.push({
        ...invItem,
        color,
        store,
        cartQuantity,
      })
    }
    const category = await this.getExternalCategory(
      externalPart.externalCategoryId,
      externalPart.type
    )
    if (!category) {
      return
    }
    return {
      ...externalPart,
      variants: eppvs,
      invItems: eppiis,
      category,
    }
  }
  async getExternalCategoryPageExternalParts(
    type: 'Lego' | 'BrickLink' | 'Rebrickable',
    categoryId: string
  ): Promise<ExternalCategoryPageExternalPart[] | undefined> {
    const parts: ExternalItem[] | undefined =
      await this.getExternalPartsInExternalCategory(type, categoryId)
    if (!parts || parts.length === 0) {
      return
    }
    const ecpeps: ExternalCategoryPageExternalPart[] = []
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const numInvItems: number | undefined = await this.getNumInvItemsByPart(
        part.externalItemId,
        type
      )
      if (numInvItems === undefined || numInvItems === 0) {
        continue
      }
      const numVariants: number | undefined = await this.getNumVariantsByPart(
        part.externalItemId,
        type
      )
      if (numVariants === undefined) {
        continue
      }
      const firstVariant = await this.getFirstVariantByPart(part.externalItemId)
      loadExternalPartPrice(part.type, part.itemId)
      ecpeps.push({
        ...part,
        numInvItems,
        numVariants,
        image: firstVariant?.image,
      })
    }
    return ecpeps
  }
  async getExternalItemsInExternalCategory(
    type: string,
    externalCategoryId: string
  ): Promise<ExternalItem[] | undefined> {
    const id = type + '-' + externalCategoryId
    // if (this.externalPartsByExternalCategory.has(id)) {
    //   return this.externalPartsByExternalCategory.get(id)
    // }
    const externalItems = await getAllFromIndex<ExternalItem>(
      this.db,
      indices.EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY,
      [type, externalCategoryId]
    )
    if (!externalItems) {
      return
    }
    const externalItemsWithStoreItems: ExternalItem[] = []
    for (let i = 0; i < externalItems.length; i++) {
      const item = externalItems[i]
      // const storeItems = await liveObjectCache.getInvItemsByExternalPart(
      //   item.externalItemId,
      //   item.type
      // )
      // if (!storeItems || storeItems.length === 0) {
      //   continue
      // }
      externalItemsWithStoreItems.push(item)
    }
    return externalItemsWithStoreItems
  }
  async getExternalPartsInExternalCategory(
    type: string,
    externalCategoryId: string
  ): Promise<ExternalItem[] | undefined> {
    const id = type + '-' + externalCategoryId
    if (this.externalPartsByExternalCategory.has(id)) {
      return this.externalPartsByExternalCategory.get(id)
    }
    const externalItems = await getAllFromIndex<ExternalItem>(
      this.db,
      indices.EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY,
      [type, externalCategoryId]
    )
    if (!externalItems) {
      return
    }
    const externalItemsWithStoreItems: ExternalItem[] = []
    for (let i = 0; i < externalItems.length; i++) {
      const item = externalItems[i]
      const storeItems = await liveObjectCache.getInvItemsByExternalPart(
        item.externalItemId,
        item.type
      )
      if (!storeItems || storeItems.length === 0) {
        continue
      }
      externalItemsWithStoreItems.push(item)
    }
    this.externalPartsByExternalCategory.set(id, externalItemsWithStoreItems)
    return externalItemsWithStoreItems
  }
  getComputedHomeData(): Ref<HomeData> {
    return this.computedCache.homeData
  }
  async getHomeData(): Promise<HomeData | undefined> {
    const stores = (await this.db.getAllKeys(STORES.STORES.name)).length
    const categories = (await this.db.getAllKeys(STORES.CATEGORIES.name)).length
    const colors = (await this.db.getAllKeys(STORES.COLORS.name)).length
    const parts = (await this.db.getAllKeys(STORES.PARTS.name)).length
    const conditions = 2
    const lists = (await this.db.getAllKeys(STORES.LISTS.name)).length
    const searches = (await this.db.getAllKeys(STORES.SEARCHES.name)).length
    const carts = (await this.db.getAllKeys(STORES.CARTS.name)).length
    return {
      stores,
      categories,
      colors,
      parts,
      conditions,
      lists,
      searches,
      carts,
    }
  }
}
