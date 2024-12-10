import { IDBPDatabase } from 'idb';
import { ActiveSearch, CartWithItems, CategoriesPageCategory, Category, Color, ExternalCategory, ExternalCategoryPageExternalPart, ExternalItem, HomeData, InvItem, Item, ItemVariant, PartPageCategory, Search, SearchFilter, Store, StorePageInvItemItem, UiColor } from '../types';
import STORES from './stores'
import { getFirstActiveCart, getCartItems } from './carts';
import { getExternalCategoriesByCategoryId, getCategoriesPageCategories, getCategory, getExternalCategory, getPartPageCategory } from './categories';
import { getColor } from './colors';
import { getInvItemFromId } from './invItems';
import { getStorePageExternalPart, getStorePagePart } from './parts';
import { getFirstActiveSearch, getSearchFilters } from './searches';
import { getStore } from './storeMethods';
import { getNumStores } from './idb2';
import { countFromIndex, getAll, getAllFromIndex, getFromIndex } from './db';
import indices from './indices';
import { cheapestPrice } from '../utils';

interface Filter<T> {
  included: T[]
  excluded: T[]
}
function getTypeFilters<T extends string | number>(filters: SearchFilter[], type: string): Filter<T> {
  const matching = filters.filter(f => f.type === type)
  // @ts-ignore
  const included: T[] = matching.filter(f => !f.isExcluded).map(f => f.objectId)
  // @ts-ignore
  const excluded: T[] = matching.filter(f => !f.isExcluded).map(f => f.objectId)
  return {
    included,
    excluded
  }
}

export default class ObjectCache {
  allCategories: Category[] | undefined
  colors: Map<string, UiColor>
  categories: Map<number, Category>
  categoriesPageCategories: Map<string, CategoriesPageCategory>
  cheapestPrices: Map<string, number>
  externalCategories: Map<string, ExternalCategory>
  externalCategoriesByCategoryId: Map<string, ExternalCategory[]>
  externalPartsByPart: Map<number, ExternalItem[]>
  externalPartsByExternalCategory: Map<string, ExternalItem[]>
  partPageCategories: Map<string, Category>
  parts: Map<string, Item>
  externalParts: Map<string, StorePageInvItemItem>
  numInvItemsByPart: Map<string, number>
  numVariantsByPart: Map<string, number>
  stores: Map<string, Store>
  activeCart: CartWithItems | undefined
  activeSearch: ActiveSearch | undefined
  partVariantsByPartColor: Map<string, ItemVariant[]>
  partVariantByPartColor: Map<string, ItemVariant>
  firstVariantByPart: Map<string, ItemVariant>
  invItems: Map<string, InvItem>
  db: IDBPDatabase
  constructor(db: IDBPDatabase) {
    this.db = db
    this.partVariantsByPartColor = new Map<string, ItemVariant[]>()
    this.cheapestPrices = new Map<string, number>()
    this.partVariantByPartColor = new Map<string, ItemVariant>()
    this.firstVariantByPart = new Map<string, ItemVariant>()
    this.numInvItemsByPart = new Map<string, number>()
    this.numVariantsByPart = new Map<string, number>()
    this.externalPartsByPart = new Map<number, ExternalItem[]>()
    this.externalPartsByExternalCategory = new Map<string, ExternalItem[]>()
    this.colors = new Map<string, UiColor>()
    this.categories = new Map<number, Category>()
    this.categoriesPageCategories = new Map<string, CategoriesPageCategory>()
    this.externalCategoriesByCategoryId = new Map<string, ExternalCategory[]>()
    this.externalCategories = new Map<string, ExternalCategory>()
    this.partPageCategories = new Map<string, Category>()
    this.parts = new Map<string, Item>()
    this.externalParts = new Map<string, StorePageInvItemItem>()
    this.invItems = new Map<string, InvItem>()
    this.stores = new Map<string, Store>()
    this.activeCart = undefined
  }
  async getAllCategories() {
    if (!this.allCategories) {
      this.allCategories = await getAll(this.db, STORES.CATEGORIES)
      this.allCategories.forEach(c => {
        this.categories.set(c.id, c)
      })
    }
    return this.allCategories
  }
  async getCheapestPrice(itemId: number, targetQ: number, ignoreColor: boolean, colorId: string) {
    const id = itemId + '-' + targetQ + '-' + ignoreColor + '-' + colorId
    if (this.cheapestPrices.has(id)) {
      return this.cheapestPrices.get(id)
    }
    const matchingParts = await this.getExternalPartsByPart(itemId)
    console.log(itemId, id, matchingParts)
    if (!matchingParts) {
      return
    }
    const allMatchingInvItems = new Map<string, InvItem>()
    for (let i = 0; i < matchingParts.length; i++) {
      const matchingPart = matchingParts[i]
      let matches: InvItem[] = []
      if (ignoreColor) {
        matches = await getAllFromIndex(this.db, indices.INV_ITEMS_BY_ITEM, matchingPart.externalItemId)
      } else {
        matches = await getAllFromIndex(this.db, indices.INV_ITEMS_BY_ITEM_AND_COLOR, [matchingPart.externalItemId, colorId])
      }
      matches.forEach((match) => allMatchingInvItems.set(match.storeId + '//' + match.invId, match))
    }
    const price = cheapestPrice(Array.from(allMatchingInvItems.values()), targetQ, true)
    this.cheapestPrices.set(id, price)
    return price
  }
  async getFirstVariantByPart(itemId: string): Promise<ItemVariant | undefined> {
    if (this.firstVariantByPart.has(itemId)) {
      return this.firstVariantByPart.get(itemId)
    }
    const variant: ItemVariant = await getFromIndex(this.db, indices.PART_VARIANTS_BY_PART, itemId)
    this.firstVariantByPart.set(itemId, variant)
    return variant
  }
  async getPartVariantsByPartColor(itemId: string, colorId: string) {
    const id = itemId + colorId
    if (this.partVariantsByPartColor.has(id)) {
      return this.partVariantsByPartColor.get(id)
    }
    const variants: ItemVariant[] = await getAllFromIndex(this.db, indices.PART_VARIANTS_BY_PART_AND_COLOR, [itemId, colorId])
    this.partVariantsByPartColor.set(id, variants)
    return variants
  }
  async getPartVariantByPartColor(itemId: string, colorId: string) {
    const id = itemId + colorId
    if (this.partVariantByPartColor.has(id)) {
      return this.partVariantByPartColor.get(id)
    }
    const variant: ItemVariant = await getFromIndex(this.db, indices.PART_VARIANTS_BY_PART_AND_COLOR, [itemId, colorId])
    this.partVariantByPartColor.set(id, variant)
    return variant
  }
  async getExternalPartsByPart(id: number): Promise<ExternalItem[] | undefined> {
    if (this.externalPartsByPart.has(id)) {
      return this.externalPartsByPart.get(id)
    }
    const externalItems: ExternalItem[] = await getAllFromIndex(this.db, indices.EXTERNAL_PARTS_BY_PART, id)
    this.externalPartsByPart.set(id, externalItems)
    return externalItems
  }
  async getAllObjects<T>(map: Map<string | number, T>, getter: Function, idMapper: Function = (value: T) => value.id): Promise<T[]> {
    if (map.size === 0) {
      const values = await getter()
      values.forEach((value: T) => {
        map.set(idMapper(value), value)
      })
    }
    return Array.from(map.values())
  }
  async getObject<T>(map: Map<string | number, T>, id: string | number, getter: Function): Promise<T | undefined> {
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
  async getActiveCart(): Promise<CartWithItems> {
    if (!this.activeCart) {
      let cart = await getFirstActiveCart(this.db)
      if (!cart) {
        const newCart = {
          active: 1,
          name: new Date().toISOString()
        }
        cart = {
          ...newCart,
          id: await this.db.put(STORES.CARTS.name, newCart)
        }
      }
      this.activeCart = {
        ...cart,
        cartItems: await getCartItems(this.db, cart)
      }
    }
    return this.activeCart
  }
  async getActiveSearch(): Promise<ActiveSearch> {
    if (!this.activeSearch) {
      let search = await getFirstActiveSearch(this.db)
      if (!search) {
        const newSearch: Search = {
          id: 0,
          active: 1,
          name: new Date().toISOString(),
          filters: [],
          priceScoreQuantity: 100,
          priceScoreIgnoreColor: true
        }
        search = {
          ...newSearch,
          id: await this.db.put(STORES.SEARCHES.name, newSearch)
        }
      }
      const filters = await getSearchFilters(this.db, search)
      const categories = getTypeFilters<number>(filters, 'category')
      const colors = getTypeFilters<number>(filters, 'color')
      const conditions = getTypeFilters<string>(filters, 'condition')
      const parts = getTypeFilters<number>(filters, 'part')
      const stores = getTypeFilters<string>(filters, 'store')
      this.activeSearch = {
        ...search,
        filters,
        categories,
        colors,
        conditions,
        parts,
        stores
      }
    }
    return this.activeSearch
  }
  async getInvItem(storeId: string, invItemId: string) {
    return this.getObject(this.invItems, storeId + '//' + invItemId, async () => await getInvItemFromId(this.db, storeId, invItemId))
  }
  async getStore(storeId: string) {
    return this.getObject(this.stores, storeId, async () => await getStore(this.db, storeId))
  }
  async getColor(colorId: string): Promise<Color | undefined> {
    return this.getObject(this.colors, colorId, async () => await getColor(this.db, colorId))
  }
  async getCategory(categoryId: number): Promise<Category | undefined> {
    return this.getObject<Category | undefined>(this.categories, categoryId, async () => await getCategory(this.db, categoryId))
  }
  async getExternalCategory(categoryId: string, type: "BrickLink" | "Lego" | "Rebrickable"): Promise<ExternalCategory | undefined> {
    return this.getObject<ExternalCategory | undefined>(this.externalCategories, categoryId, async () => await getExternalCategory(this.db, categoryId, type))
  }
  async getPartPageCategory(categoryId: string): Promise<PartPageCategory | undefined> {
    return this.getObject<PartPageCategory | undefined>(this.partPageCategories, categoryId, async () => await getPartPageCategory(this.db, categoryId))
  }
  async getStorePagePart(partId: string): Promise<Item | undefined> {
    return this.getObject<Item | undefined>(this.parts, partId, async () => await getStorePagePart(partId, this))
  }
  async getStorePageExternalPart(invItem: InvItem, type: "BrickLink" | "Lego"): Promise<StorePageInvItemItem | undefined> {
    return this.getObject<StorePageInvItemItem | undefined>(this.externalParts, invItem.itemId, async () => await getStorePageExternalPart(invItem, type, this))
  }
  async getCategoriesPageCategories(): Promise<CategoriesPageCategory[]> {
    return this.getAllObjects<CategoriesPageCategory>(this.categoriesPageCategories, async () => await getCategoriesPageCategories())
  }
  async getExternalCategoriesByCategoryId(id: number): Promise<ExternalCategory[] | undefined> {
    return this.getObject<ExternalCategory[]>(this.externalCategoriesByCategoryId, id, async () => await getExternalCategoriesByCategoryId(id, this))
  }
  async getNumInvItemsByPart(externalItemId: string): Promise<number | undefined> {
    if (this.numInvItemsByPart.has(externalItemId)) {
      return this.numInvItemsByPart.get(externalItemId)
    }
    const num = await countFromIndex(this.db, indices.INV_ITEMS_BY_ITEM, externalItemId)
    this.numInvItemsByPart.set(externalItemId, num)
    return num
  }
  async getNumVariantsByPart(externalItemId: string): Promise<number | undefined> {
    if (this.numVariantsByPart.has(externalItemId)) {
      return this.numVariantsByPart.get(externalItemId)
    }
    const num = await countFromIndex(this.db, indices.PART_VARIANTS_BY_PART, externalItemId)
    this.numVariantsByPart.set(externalItemId, num)
    return num
  }
  async getExternalCategoryPageExternalParts(type: 'Lego' | 'BrickLink' | 'Rebrickable', categoryId: string): Promise<ExternalCategoryPageExternalPart[] | undefined> {
    const parts: ExternalItem[] | undefined = await this.getExternalPartsInExternalCategory(type, categoryId)
    if (!parts) {
      return
    }
    const ecpeps: ExternalCategoryPageExternalPart[] = []
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const numInvItems: number | undefined = await this.getNumInvItemsByPart(part.externalItemId)
      if (numInvItems === undefined) {
        continue
      }
      const numVariants: number | undefined = await this.getNumVariantsByPart(part.externalItemId)
      if (numVariants === undefined) {
        continue
      }
      const firstVariant = await this.getFirstVariantByPart(part.externalItemId)
      ecpeps.push({
        ...part,
        numInvItems,
        numVariants,
        image: firstVariant?.image
      })
    }
    return ecpeps
  }
  async getExternalPartsInExternalCategory(type: string, externalCategoryId: string): Promise<ExternalItem[] | undefined> {
    const id = type + '-' + externalCategoryId
    if (this.externalPartsByExternalCategory.has(id)) {
      return this.externalPartsByExternalCategory.get(id)
    }
    const externalItems: ExternalItem[] = await getAllFromIndex(this.db, indices.EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY, [type, externalCategoryId])
    this.externalPartsByExternalCategory.set(id, externalItems)
    return externalItems
  }
  async getHomeData(): Promise<HomeData | undefined> {
    const stores = (await this.db.getAllKeys(STORES.CATEGORIES.name)).length
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
      carts
    }
  }

}