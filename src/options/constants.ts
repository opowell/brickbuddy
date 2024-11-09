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
  STORE: 'store'
}

export const Routes = {
  home: '/',
  stores: '/stores',
  colors: '/colors',
  categories: '/categories',
  parts: '/parts',
  searches: '/searches',
  shoppingLists: '/shopping-lists',
  part(id: string) {
    return '/' + LINKS.PART + '/' + encodeURIComponent(id)
  },
  store(id: string) {
    return '/' + LINKS.STORE + '/' + encodeURIComponent(id)
  },
}

export const Hrefs = {
  home: Routes.home,
  stores: Routes.stores,
  colors: Routes.colors,
  categories: Routes.categories,
  parts: Routes.parts,
  searches: Routes.searches,
  shoppingLists: Routes.shoppingLists,
  part(id: string) {
    return Routes.part(id)
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
  stores: {
    title: 'Stores',
    href: Hrefs.stores
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
  part(title: string, id: string) {
    return {
      title,
      href: Hrefs.part(id)
    }
  },
  store(id: string) {
    return {
      title: 'store',
      href: Hrefs.store(id)
    }
  },
}
