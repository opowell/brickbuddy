export interface StoreDefinition {
  name: string
  keyPath: string | string[]
  autoIncrement?: boolean
}
const stores: {
  BRICK_LINK_STORE_PAGES: StoreDefinition
  CARTS: StoreDefinition
  CART_ITEMS: StoreDefinition
  CATEGORIES: StoreDefinition
  COLORS: StoreDefinition
  COMPUTEDS: StoreDefinition
  CONDITIONS: StoreDefinition
  EXTERNAL_CATEGORIES: StoreDefinition
  EXTERNAL_COLORS: StoreDefinition
  EXTERNAL_PARTS: StoreDefinition
  INVENTORY_ITEMS: StoreDefinition
  PART_VARIANTS: StoreDefinition
  PARTS: StoreDefinition
  SEARCHES: StoreDefinition
  SEARCH_CATEGORIES: StoreDefinition
  SEARCH_FILTERS: StoreDefinition
  SEARCH_CONDITION_PRICE_ADJUSTMENTS: StoreDefinition
  SEARCH_STORES: StoreDefinition
  STORE_COUNTRIES: StoreDefinition
  LISTS: StoreDefinition
  LIST_ITEMS: StoreDefinition
  STORES: StoreDefinition
} = {
  BRICK_LINK_STORE_PAGES: {
    name: 'brickLinkStorePages',
    keyPath: 'url',
  },
  CARTS: {
    name: 'carts',
    keyPath: 'id',
    autoIncrement: true,
  },
  CART_ITEMS: {
    name: 'cartItems',
    keyPath: ['cartId', 'storeId', 'invItemId'],
  },
  CATEGORIES: {
    name: 'categories',
    keyPath: 'id',
    autoIncrement: true,
  },
  COLORS: {
    name: 'colors',
    keyPath: 'id',
    autoIncrement: true,
  },
  COMPUTEDS: {
    name: 'computeds',
    keyPath: 'id',
  },
  CONDITIONS: {
    name: 'conditions',
    keyPath: 'id',
  },
  EXTERNAL_CATEGORIES: {
    name: 'externalCategories',
    keyPath: ['type', 'id'],
  },
  EXTERNAL_COLORS: {
    name: 'externalColors',
    keyPath: 'id',
  },
  EXTERNAL_PARTS: {
    name: 'externalParts',
    keyPath: ['type', 'externalItemId'],
  },
  INVENTORY_ITEMS: {
    name: 'inventoryItems',
    keyPath: ['storeId', 'invId'],
  },
  LISTS: {
    name: 'lists',
    keyPath: 'id',
    autoIncrement: true,
  },
  LIST_ITEMS: {
    name: 'listItems',
    keyPath: ['listId', 'itemId', 'colors'],
  },
  PART_VARIANTS: {
    name: 'partVariants',
    keyPath: ['type', 'itemId', 'colorId'],
  },
  PARTS: {
    name: 'parts',
    keyPath: 'itemId',
    autoIncrement: true,
  },
  SEARCHES: {
    name: 'searches',
    keyPath: 'id',
    autoIncrement: true,
  },
  SEARCH_FILTERS: {
    name: 'searchFilters',
    keyPath: ['searchId', 'type', 'objectId'],
  },
  SEARCH_CATEGORIES: {
    name: 'searchCategories',
    keyPath: ['searchId', 'categoryId'],
  },
  SEARCH_CONDITION_PRICE_ADJUSTMENTS: {
    name: 'searchConditionPriceAdjustments',
    keyPath: ['searchId', 'condition'],
  },
  SEARCH_STORES: {
    name: 'searchStores',
    keyPath: ['searchId', 'storeId'],
  },
  STORE_COUNTRIES: {
    name: 'storeCountries',
    keyPath: 'id',
  },
  STORES: {
    name: 'stores',
    keyPath: 'id',
  },
}

export default stores
