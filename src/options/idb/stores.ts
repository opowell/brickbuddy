export interface StoreDefinition {
  name: string
  keyPath: string | string[]
  autoIncrement?: boolean
}
const stores: {
  CARTS: StoreDefinition
  CART_ITEMS: StoreDefinition
  CATEGORIES: StoreDefinition
  COLORS: StoreDefinition
  EXTERNAL_CATEGORIES: StoreDefinition
  EXTERNAL_COLORS: StoreDefinition
  EXTERNAL_PARTS: StoreDefinition
  INVENTORY_ITEMS: StoreDefinition
  PART_VARIANTS: StoreDefinition
  PARTS: StoreDefinition
  SEARCHES: StoreDefinition
  SEARCH_FILTERS: StoreDefinition
  LISTS: StoreDefinition
  LIST_ITEMS: StoreDefinition
  STORES: StoreDefinition
} = {
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
    autoIncrement: true
  },
  COLORS: {
    name: 'colors',
    keyPath: 'id',
    autoIncrement: true
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
    keyPath: ['type', 'externalItemId']
  },
  INVENTORY_ITEMS: {
    name: 'inventoryItems',
    keyPath: ['storeId', 'invId'],
  },
  LISTS: {
    name: 'lists',
    keyPath: 'id',
    autoIncrement: true
  },
  LIST_ITEMS: {
    name: 'listItems',
    keyPath: ['listId', 'itemId', 'colors']
  },
  PART_VARIANTS: {
    name: 'partVariants',
    keyPath: ['type', 'itemId', 'colorId']
  },
  PARTS: {
    name: 'parts',
    keyPath: 'itemId',
    autoIncrement: true
  },
  SEARCHES: {
    name: 'searches',
    keyPath: 'id',
    autoIncrement: true
  },
  SEARCH_FILTERS: {
    name: 'searchFilters',
    keyPath: ['searchId', 'type', 'objectId'],
  },
  STORES: {
    name: 'stores',
    keyPath: 'id',
  },
}

export default stores