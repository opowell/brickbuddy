import { IDBPDatabase } from 'idb';
import STORES, { StoreDefinition } from './stores'
import { getAll } from './db';
import { ActiveSearch, Cart, Category, Color, Condition, HomeData, Item, Search, ShopList, Store } from '../types';
import ObjectCache from './ObjectCacheClass';

export default class ComputedObjectCache {
  cartsMap: Ref<Map<string, Cart>>
  cartsArray: Ref<Cart[] | undefined>
  categoriesMap: Ref<Map<string, Category>>
  categoriesArray: Ref<Category[] | undefined>
  categoriesArraySearchFiltered: ComputedRef<Category[] | undefined>
  colorsMap: Ref<Map<string, Color>>
  colorsArray: Ref<Color[] | undefined>
  conditionsMap: Ref<Map<string, Condition>>
  conditionsArray: Ref<Condition[] | undefined>
  searchesMap: Ref<Map<string, Search>>
  searchesArray: Ref<Search[] | undefined>
  storesMap: Ref<Map<string, Store>>
  storesArray: Ref<Store[] | undefined>
  itemsMap: Ref<Map<string, Item>>
  itemsArray: Ref<Item[] | undefined>
  listsMap: Ref<Map<string, ShopList>>
  listsArray: Ref<ShopList[] | undefined>
  activeSearch: ComputedRef<ActiveSearch | undefined>
  loaded: ComputedRef<boolean>
  homeData: ComputedRef<HomeData>
  db: IDBPDatabase
  constructor(objectCache: ObjectCache) {
    this.loaded = computed(() => {
      return !!this.colorsMap.value && !!this.storesMap.value
    })
    this.db = objectCache.db
    this.cartsMap = ref(new Map<string, Cart>)
    this.cartsArray = ref<Cart[] | undefined>()
    this.categoriesMap = ref(new Map<string, Category>)
    this.categoriesArray = ref<Category[] | undefined>()
    this.colorsMap = ref(new Map<string, Color>)
    this.colorsArray = ref<Color[] | undefined>()
    this.conditionsMap = ref(new Map<string, Condition>)
    this.conditionsArray = ref<Condition[] | undefined>()
    this.itemsMap = ref(new Map<string, Item>)
    this.itemsArray = ref<Item[] | undefined>()
    this.listsMap = ref(new Map<string, ShopList>)
    this.listsArray = ref<ShopList[] | undefined>()
    this.searchesMap = ref(new Map<string, Search>)
    this.searchesArray = ref<Search[] | undefined>()
    this.storesMap = ref(new Map<string, Store>)
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
      console.log('compute')
      const search = objectCache.activeSearchRef.value
      if (!search) {
        console.log('no search')
        return undefined
      }
      if (!this.categoriesArray.value) {
        console.log('no array')
        return undefined
      }
      return this.categoriesArray.value.filter(c => {
        if (search.categories.included.length > 0) {
          return search.categories.included.includes(c.id)
        }
        return !search.categories.excluded.includes(c.id)
      })
    })
    objectCache.getActiveSearch()
    this.loadColors()
    this.loadObjects(STORES.STORES, this.storesArray, this.storesMap)
    this.loadObjects(STORES.CATEGORIES, this.categoriesArray, this.categoriesMap)
    this.loadObjects(STORES.PARTS, this.itemsArray, this.itemsMap)
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
  async loadObjects<T>(storeDefinition: StoreDefinition, array: Ref<T[] | undefined>, map: Ref<Map<string | number, T>>) {
    const objects = await getAll<T>(this.db, storeDefinition)
    if (!objects) {
      return
    }
    array.value = objects
    objects.forEach(object => {
      map.value.set(object.id, object)
    })
  }
}