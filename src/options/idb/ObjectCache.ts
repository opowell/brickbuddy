import { IDBPDatabase } from 'idb';
import { CartWithItems, Category, Item, UiColor } from './../types';
import { getActiveCart, getCategory, getColor, getStorePagePart } from './idb';
export default class ObjectCache {
  colors: Map<string, UiColor>
  categories: Map<string, Category>
  parts: Map<string, Item>
  activeCart: CartWithItems | undefined
  db: IDBPDatabase
  constructor(db: IDBPDatabase) {
    this.db = db
    this.colors = new Map<string, UiColor>
    this.categories = new Map<string, Category>
    this.parts = new Map<string, Item>
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
  async getColor(colorId: string) {
    return this.getObject(this.colors, colorId, async () => await getColor(this.db, colorId))
  }
  async getCategory(categoryId: string) {
    return this.getObject(this.categories, categoryId, async () => await getCategory(this.db, categoryId))
  }
  async getStorePagePart(partId: string) {
    return this.getObject(this.parts, partId, async () => await getStorePagePart(partId, this))
  }
}