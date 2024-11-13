import { categories } from "./idb"

export const DB_NAME = 'brickbuddy'

export const PAGES = {
  HOME: 'home',
  CATEGORIES: 'categories',
  CATEGORY: 'category',
  COLORS: 'colors',
  SEARCHES: 'searches',
  STORE: 'store',
  SHOP_LIST: 'shopList',
  SHOP_LISTS: 'shopLists',
  PART: 'part',
  PARTS: 'parts',
  COLOR: 'color',
  SEARCH: 'search',
  PART_VARIANT: 'partVariant',
  STORES: 'stores'
}

export const LINKS = {
  PART: 'part',
  PART_VARIANT: 'partVariant',
  STORE: 'store',
  COLOR: 'color',
  CATEGORY: 'category',
  CONDITION: 'condition'
}

export const Routes = {
  home: '/',
  activeSearch: '/active-search',
  stores: '/stores',
  colors: '/colors',
  conditions: '/conditions',
  categories: '/categories',
  parts: '/parts',
  searches: '/searches',
  shoppingLists: '/shopping-lists',
  category(id: string) {
    return '/' + LINKS.CATEGORY + '/' + encodeURIComponent(id)
  },
  condition(id: string) {
    return '/' + LINKS.CONDITION + '/' + encodeURIComponent(id)
  },
  color(id: number) {
    return '/' + LINKS.COLOR + '/' + encodeURIComponent(id)
  },
  part(id: string) {
    return '/' + LINKS.PART + '/' + encodeURIComponent(id)
  },
  partVariant(itemId: string, colorId: number) {
    return '/' + LINKS.PART + '/' + encodeURIComponent(itemId) + '/' + LINKS.PART_VARIANT + '/' + encodeURIComponent(colorId)
  },
  store(id: string) {
    return '/' + LINKS.STORE + '/' + encodeURIComponent(id)
  },
}

export const Hrefs = {
  home: Routes.home,
  activeSearch: Routes.activeSearch,
  stores: Routes.stores,
  conditions: Routes.conditions,
  colors: Routes.colors,
  categories: Routes.categories,
  parts: Routes.parts,
  searches: Routes.searches,
  shoppingLists: Routes.shoppingLists,
  category(id: string) {
    return Routes.category(id)
  },
  condition(id: string) {
    return Routes.condition(id)
  },
  color(id: number) {
    return Routes.color(id)
  },
  part(id: string) {
    return Routes.part(id)
  },
  partVariant(itemId: string, colorId: number) {
    return Routes.partVariant(itemId, colorId)
  },
  store(id: string) {
    return Routes.store(id)
  }
}

export const Crumbs = {
  home: {
    title: 'Home',
    href: Hrefs.home
  },
  activeSearch: {
    title: 'Active search',
    href: Hrefs.activeSearch
  },
  stores: {
    title: 'Stores',
    href: Hrefs.stores
  },
  conditions: {
    title: 'Conditions',
    href: Hrefs.conditions
  },
  searches: {
    title: 'Searches',
    href: Hrefs.searches
  },
  colors: {
    title: 'Colors',
    href: Hrefs.colors
  },
  categories: {
    title: 'Categories',
    href: Hrefs.categories
  },
  parts: {
    title: 'Parts',
    href: Hrefs.parts
  },
  shoppingLists: {
    title: 'Shopping Lists',
    href: Hrefs.shoppingLists
  },
  condition(id: string) {
    return {
      id,
      href: Hrefs.condition(id)
    }
  },
  category(title: string, id: string) {
    return {
      title,
      href: Hrefs.category(id)
    }
  },
  color(title: string, id: number) {
    return {
      title,
      href: Hrefs.color(id)
    }
  },
  part(title: string, id: string) {
    return {
      title,
      href: Hrefs.part(id)
    }
  },
  partVariant(title: string, itemId: string, colorId: number) {
    return {
      title,
      href: Hrefs.partVariant(itemId, colorId)
    }
  },
  store(id: string) {
    return {
      title: 'store',
      href: Hrefs.store(id)
    }
  },
}
