import { StoreType } from '../types'

export const DB_NAME = 'brickbuddy'

export const PAGES = {
  HOME: 'home',
  CATEGORIES: 'categories',
  CATEGORY: 'category',
  COLORS: 'colors',
  SEARCHES: 'searches',
  STORE: 'store',
  SHOP_LIST: 'shopList',
  LISTS: 'lists',
  PART: 'part',
  PARTS: 'parts',
  COLOR: 'color',
  SEARCH: 'search',
  PART_VARIANT: 'partVariant',
  STORES: 'stores',
}

export const LINKS = {
  PART: 'part',
  EXTERNAL_PART: 'externalPart',
  PART_VARIANT: 'partVariant',
  STORE: 'store',
  SEARCH: 'search',
  COLOR: 'color',
  CART: 'cart',
  EXTERNAL_CATEGORY: 'externalCategory',
  CATEGORY: 'category',
  CONDITION: 'condition',
}

export const Routes = {
  home: '/',
  activeCart: '/cart',
  activeSearch: '/active-search',
  carts: '/carts',
  stores: '/stores',
  storeCountries: '/store-countries',
  colors: '/colors',
  conditions: '/conditions',
  brickLinkCategories: '/brick-link-categories',
  categories: '/categories',
  parts: '/parts',
  searches: '/searches',
  lists: '/lists',
  category(id: number) {
    return '/' + LINKS.CATEGORY + '/' + encodeURIComponent(id)
  },
  externalCategory(id: string, type: string) {
    return (
      '/' + LINKS.EXTERNAL_CATEGORY + '/' + type + '/' + encodeURIComponent(id)
    )
  },
  cart(id: number) {
    return '/' + LINKS.CART + '/' + id
  },
  condition(id: string) {
    return '/' + LINKS.CONDITION + '/' + encodeURIComponent(id)
  },
  color(id: string) {
    return '/' + LINKS.COLOR + '/' + encodeURIComponent(id)
  },
  externalPart(id: string, type: string) {
    return '/' + LINKS.EXTERNAL_PART + '/' + type + '/' + encodeURIComponent(id)
  },
  part(id: number) {
    return '/' + LINKS.PART + '/' + encodeURIComponent(id)
  },
  partVariant(itemId: string, colorId: string) {
    return (
      '/' +
      LINKS.PART +
      '/' +
      encodeURIComponent(itemId) +
      '/' +
      LINKS.PART_VARIANT +
      '/' +
      encodeURIComponent(colorId)
    )
  },
  store(type: StoreType, id: string) {
    return (
      '/' + LINKS.STORE + '/' + type.toString() + '/' + encodeURIComponent(id)
    )
  },
  search(id: number) {
    return '/' + LINKS.SEARCH + '/' + encodeURIComponent(id)
  },
}

export const Hrefs = {
  home: Routes.home,
  carts: Routes.carts,
  activeCart: Routes.activeCart,
  activeSearch: Routes.activeSearch,
  stores: Routes.stores,
  storeCountries: Routes.storeCountries,
  conditions: Routes.conditions,
  colors: Routes.colors,
  brickLinkCategories: Routes.brickLinkCategories,
  categories: Routes.categories,
  parts: Routes.parts,
  searches: Routes.searches,
  lists: Routes.lists,
  cart(id: number) {
    return Routes.cart(id)
  },
  category(id: number) {
    return Routes.category(id)
  },
  externalCategory(id: string, type: string) {
    return Routes.externalCategory(id, type)
  },
  condition(id: string) {
    return Routes.condition(id)
  },
  color(id: string) {
    return Routes.color(id)
  },
  part(id: number) {
    return Routes.part(id)
  },
  externalPart(id: string, type: string) {
    return Routes.externalPart(id, type)
  },
  partVariant(itemId: string, colorId: string) {
    return Routes.partVariant(itemId, colorId)
  },
  search(id: number) {
    return Routes.search(id)
  },
  store(type: StoreType, id: string) {
    return Routes.store(type, id)
  },
}

export const Crumbs = {
  home: {
    title: 'Home',
    href: Hrefs.home,
  },
  carts: {
    title: 'Carts',
    href: Hrefs.carts,
  },
  stores: {
    title: 'Stores',
    href: Hrefs.stores,
  },
  storeCountries: {
    title: 'Store Countries',
    href: Hrefs.storeCountries,
  },
  conditions: {
    title: 'Conditions',
    href: Hrefs.conditions,
  },
  searches: {
    title: 'Searches',
    href: Hrefs.searches,
  },
  colors: {
    title: 'Colors',
    href: Hrefs.colors,
  },
  brickLinkCategories: {
    title: 'BrickLink Categories',
    href: Hrefs.brickLinkCategories,
  },
  categories: {
    title: 'Categories',
    href: Hrefs.categories,
  },
  parts: {
    title: 'Parts',
    href: Hrefs.parts,
  },
  lists: {
    title: 'Shopping Lists',
    href: Hrefs.lists,
  },
  search(id: number) {
    return {
      title: 'Search',
      href: Hrefs.search(id),
    }
  },
  cart(id: number) {
    return {
      title: 'Cart',
      href: Hrefs.cart(id),
    }
  },
  condition(id: string) {
    return {
      id,
      href: Hrefs.condition(id),
    }
  },
  externalCategory(title: string | undefined, id: string, type: string) {
    return {
      title,
      href: Hrefs.externalCategory(id, type),
    }
  },
  category(title: string | undefined, id: number) {
    return {
      title,
      href: Hrefs.category(id),
    }
  },
  color(title: string, id: string) {
    return {
      title,
      href: Hrefs.color(id),
    }
  },
  part(title: string, id: number) {
    return {
      title,
      href: Hrefs.part(id),
    }
  },
  externalPart(title: string, id: string, type: string) {
    return {
      title,
      href: Hrefs.externalPart(id, type),
    }
  },
  partVariant(title: string | undefined, itemId: string, colorId: string) {
    return {
      title,
      href: Hrefs.partVariant(itemId, colorId),
    }
  },
  store(type: StoreType, id: string) {
    return {
      title: 'store',
      href: Hrefs.store(type, id),
    }
  },
}
