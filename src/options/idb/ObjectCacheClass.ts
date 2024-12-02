import { IDBPDatabase } from 'idb';
import { ActiveSearch, CartWithItems, Category, Color, ExternalCategory, ExternalItem, InvItem, Item, PartPageCategory, Search, SearchFilter, Store, StorePageInvItemItem, UiColor } from '../types';
import STORES from './stores'
import { getFirstActiveCart, getCartItems } from './carts';
import { getCategory, getExternalCategory, getPartPageCategory } from './categories';
import { getColor } from './colors';
import { getInvItemFromId } from './invItems';
import { getStorePageExternalPart, getStorePagePart } from './parts';
import { getFirstActiveSearch, getSearchFilters } from './searches';
import { getStore } from './storeMethods';

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
  colors: Map<string, UiColor>
  categories: Map<string, Category>
  externalCategories: Map<string, ExternalCategory>
  partPageCategories: Map<string, Category>
  parts: Map<string, Item>
  externalParts: Map<string, StorePageInvItemItem>
  stores: Map<string, Store>
  activeCart: CartWithItems | undefined
  activeSearch: ActiveSearch | undefined
  invItems: Map<string, InvItem>
  db: IDBPDatabase
  constructor(db: IDBPDatabase) {
    this.db = db
    this.colors = new Map<string, UiColor>()
    this.categories = new Map<string, Category>()
    this.externalCategories = new Map<string, ExternalCategory>()
    this.partPageCategories = new Map<string, Category>()
    this.parts = new Map<string, Item>()
    this.externalParts = new Map<string, StorePageInvItemItem>()
    this.invItems = new Map<string, InvItem>()
    this.stores = new Map<string, Store>()
    this.activeCart = undefined
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
}