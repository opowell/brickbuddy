import { IDBPDatabase } from 'idb';
import STORES, { StoreDefinition } from './stores'
import { getAll } from './db';
import { Cart, CategoriesPageCategory, Category, Color, Condition, ExternalCategory, ExternalItem, HomeData, Item, Search, ShopList, Store } from '../types';
import ObjectCache from './ObjectCacheClass';

interface ExternalItem2 extends ExternalItem {
  externalCategory: ExternalCategory
}

interface Item2 extends Item {
  externalItems: ExternalItem2[]
}

interface Category2 extends Category {
  externalCategories: ExternalCategory2[]
}

interface ExternalCategory2 extends ExternalCategory {
  parts: ExternalItem2[]
}

export default class ComputedObjectCache {
  cartsMap: Ref<Map<string, Cart>>
  cartsArray: Ref<Cart[] | undefined>
  categoriesMap: Ref<Map<string, Category>>
  categoriesArray: Ref<Category[] | undefined>
  externalCategoriesMap: Ref<Map<string, ExternalCategory>>
  externalCategoriesArray: Ref<ExternalCategory[] | undefined>
  categoriesArraySearchFiltered: ComputedRef<Category[] | undefined>
  externalItemsArraySearchFiltered: ComputedRef<ExternalItem[] | undefined>
  externalItemsArray2: ComputedRef<ExternalItem2[] | undefined>
  itemsArray2: ComputedRef<Item2[] | undefined>
  itemsMap2: ComputedRef<Map<number, Item2> | undefined>
  colorsMap: Ref<Map<string, Color>>
  colorsArray: Ref<Color[] | undefined>
  conditionsMap: Ref<Map<string, Condition>>
  conditionsArray: Ref<Condition[] | undefined>
  searchesMap: Ref<Map<string, Search>>
  searchesArray: Ref<Search[] | undefined>
  storesMap: Ref<Map<string, Store>>
  storesArray: Ref<Store[] | undefined>
  externalItemsMap: Ref<Map<string, ExternalItem>>
  externalItemsArray: Ref<ExternalItem[] | undefined>
  itemsMap: Ref<Map<number, Item>>
  itemsArray: Ref<Item[] | undefined>
  listsMap: Ref<Map<string, ShopList>>
  listsArray: Ref<ShopList[] | undefined>
  loaded: ComputedRef<boolean>
  homeData: ComputedRef<HomeData>
  db: IDBPDatabase
  categoriesPageCategories: ComputedRef<CategoriesPageCategory[] | undefined>
  constructor(objectCache: ObjectCache) {
    this.loaded = computed(() => {
      return !!this.colorsMap.value && !!this.storesMap.value
    })
    this.db = objectCache.db
    this.cartsMap = ref(new Map<string, Cart>)
    this.cartsArray = ref<Cart[] | undefined>()
    this.categoriesMap = ref(new Map<string, Category>)
    this.categoriesArray = ref<Category[] | undefined>()
    this.externalCategoriesMap = ref(new Map<string, ExternalCategory>)
    this.externalCategoriesArray = ref<ExternalCategory[] | undefined>()
    this.colorsMap = ref(new Map<string, Color>())
    this.colorsArray = ref<Color[] | undefined>()
    this.conditionsMap = ref(new Map<string, Condition>)
    this.conditionsArray = ref<Condition[] | undefined>()
    this.externalItemsMap = ref(new Map<string, ExternalItem>)
    this.externalItemsArray = ref<ExternalItem[] | undefined>()
    this.itemsMap = ref(new Map<number, Item>())
    this.itemsArray = ref<Item[] | undefined>()
    this.listsMap = ref(new Map<string, ShopList>())
    this.listsArray = ref<ShopList[] | undefined>()
    this.searchesMap = ref(new Map())
    this.searchesArray = ref<Search[] | undefined>()
    this.storesMap = ref(new Map<string, Store>())
    this.storesArray = ref<Store[] | undefined>()
    this.homeData = computed<HomeData>(() => {
      return {
        stores: this.storesArray.value?.length || 0,
        categories: this.categoriesArray.value?.length || 0,
        colors: this.colorsArray.value?.length || 0,
        parts: this.itemsArray.value?.length || 0,
        conditions: this.conditionsArray.value?.length || 0,
        lists: this.listsArray.value?.length || 0,
        searches: this.searchesArray.value?.length || 0,
        carts: this.cartsArray.value?.length || 0
      }
    })
    this.categoriesArraySearchFiltered = computed(() => {
      const search = objectCache.activeSearchRef.value
      if (!search) {
        return undefined
      }
      if (!this.categoriesArray.value) {
        return undefined
      }
      if (!this.externalCategoriesArray.value) {
        return undefined
      }
      const categories = new Map<number, Category2>()
      this.categoriesArray.value.forEach(c => {
        if (search.categories.included.length > 0) {
          if (!search.categories.included.includes(c.id)) {
            return
          }
        } else if (search.categories.excluded.includes(c.id)) {
          return
        }
        const category: Category2 = {
          ...c,
          externalCategories: [],
        }
        categories.set(c.id, category)
      })
      const ec2Map = new Map<string, ExternalCategory2>()
      this.externalCategoriesArray.value.forEach(ec => {
        const category = categories.get(ec.categoryId)
        if (!category) {
          return
        }
        const ec2: ExternalCategory2 = {
          ...ec,
          parts: []
        }
        category.externalCategories.push(ec2)
        ec2Map.set(ec2.id, ec2)
      })
      if (!this.externalItemsArray2.value) {
        return
      }
      this.externalItemsArray2.value.forEach(ei2 => {
        const ec2 = ec2Map.get(ei2.externalCategoryId)
        if (!ec2) {
          return
        }
        ec2.parts.push(ei2)
      })
      return Array.from(categories.values())
    })
    this.itemsMap2 = computed(() => {
      if (!this.externalItemsArray2.value) {
        return
      }
      const out = new Map<number, Item2>()
      this.externalItemsArray2.value.forEach(ei => {
        let outItem = out.get(ei.itemId)
        if (!outItem) {
          outItem = {
            itemId: ei.itemId,
            externalItems: []
          }
        }
        outItem.externalItems.push(ei)
        out.set(ei.itemId, outItem)
      })
      return out
    })
    this.itemsArray2 = computed(() => {
      if (!this.itemsMap2.value) {
        return
      }
      const search = objectCache.activeSearchRef.value
      if (!search) {
        return
      }
      return Array.from(this.itemsMap2.value.values()).filter(i2 => {
        return i2.externalItems.some(c => {
          if (search.categories.included.length > 0) {
            return search.categories.included.includes(c.externalCategory.categoryId)
          }
          return !search.categories.excluded.includes(c.externalCategory.categoryId)
        })
      })
    })
    this.externalItemsArray2 = computed(() => {
      if (!this.externalItemsArray.value) {
        return
      }
      if (!this.externalCategoriesMap.value) {
        return
      }
      const out: ExternalItem2[] = []
      this.externalItemsArray.value.forEach(ei => {
        const externalCategory = this.externalCategoriesMap.value.get(ei.externalCategoryId)
        if (!externalCategory) {
          return
        }
        out.push({
          ...ei,
          externalCategory
        })
      })
      return out
    })
    this.externalItemsArraySearchFiltered = computed(() => {
      const search = objectCache.activeSearchRef.value
      if (!search) {
        return undefined
      }
      if (!this.externalItemsArray2.value) {
        return undefined
      }
      return this.externalItemsArray2.value.filter(c => {
        if (search.categories.included.length > 0) {
          return search.categories.included.includes(c.externalCategory.categoryId)
        }
        return !search.categories.excluded.includes(c.externalCategory.categoryId)
      })
    })
    this.categoriesPageCategories = computed(() => {
      if (!this.categoriesArraySearchFiltered.value) {
        return
      }
      return this.categoriesArraySearchFiltered.value.map(c => {
        return {
          ...c,
          parts: []
        }
      })
    })
    objectCache.getActiveSearch()
    this.loadColors()
    this.loadObjects(STORES.STORES, this.storesArray, this.storesMap)
    this.loadObjects(STORES.CATEGORIES, this.categoriesArray, this.categoriesMap)
    this.loadObjects(STORES.EXTERNAL_CATEGORIES, this.externalCategoriesArray, this.externalCategoriesMap)
    this.loadObjects(STORES.EXTERNAL_PARTS, this.externalItemsArray, this.externalItemsMap)
    this.loadObjects(STORES.PARTS, this.itemsArray, this.itemsMap, async () => {
      if (!this.itemsArray.value) {
        return
      }
      for (let i = 0; i < this.itemsArray.value.length; i++) {

      }
    })
    this.loadObjects(STORES.SEARCHES, this.searchesArray, this.searchesMap)
    this.loadObjects(STORES.LISTS, this.listsArray, this.listsMap)
    this.loadObjects(STORES.CARTS, this.cartsArray, this.cartsMap)
    this.conditionsArray.value = [
      {
        id: 'new',
        name: 'New'
      },
      {
        id: 'used',
        name: 'Used'
      }
    ]
  }
  async loadColors() {
    this.loadObjects(STORES.COLORS, this.colorsArray, this.colorsMap)
  }
  async loadObjects<T>(
    storeDefinition: StoreDefinition,
    array: Ref<T[] | undefined>,
    map: Ref<Map<string | number, T>>,
    callback?: Function
  ) {
    const objects = await getAll<T>(this.db, storeDefinition)
    if (!objects) {
      return
    }
    array.value = objects
    objects.forEach(object => {
      // @ts-ignore
      map.value.set(object.id, object)
    })
    if (callback) {
      await callback()
    }
  }
}