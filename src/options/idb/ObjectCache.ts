import { IDBPDatabase } from 'idb';
import { CartWithItems, Category, InvItem, Item, Store, UiColor } from './../types';
import { getActiveCart, getStore, getCategory, getColor, getInvItemFromId, getStorePagePart } from './idb';
export default class ObjectCache {
  colors: Map<string, UiColor>
  categories: Map<string, Category>
  parts: Map<string, Item>
  stores: Map<string, Store>
  activeCart: CartWithItems | undefined
  invItems: Map<string, InvItem>
  db: IDBPDatabase
  constructor(db: IDBPDatabase) {
    this.db = db
    this.colors = new Map<string, UiColor>()
    this.categories = new Map<string, Category>()
    this.parts = new Map<string, Item>()
    this.invItems = new Map<string, InvItem>()
    this.stores = new Map<string, Store>()
    this.activeCart = undefined
  }
  async getObject(map: Map<string, unknown>, id: string, getter: Function) {
    let object = map.get(id)
    if (!object) {
      object = await getter()
      if (!object) {
        return
      }
      map.set(id, object)
    }
    return object

  }
  getActiveCart() {
    if (!this.activeCart) {
      this.activeCart = getActiveCart()
    }
    return this.activeCart
  }
  async getInvItem(storeId: string, invItemId: string) {
    return this.getObject(this.invItems, storeId + '//' + invItemId, async () => await getInvItemFromId(this.db, storeId, invItemId))
  }
  async getStore(storeId: string) {
    return this.getObject(this.stores, storeId, async () => await getStore(this.db, storeId))
  }
  async getColor(colorId: string) {
    return this.getObject(this.colors, colorId, async () => await getColor(this.db, colorId))
  }
  async getCategory(categoryId: string): Promise<Category> {
    return this.getObject(this.categories, categoryId, async () => await getCategory(this.db, categoryId))
  }
  async getStorePagePart(partId: string) {
    return this.getObject(this.parts, partId, async () => await getStorePagePart(partId, this))
  }
}