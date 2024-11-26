export interface StoreDefinition {
  name: string
  keyPath: string | string[]
  autoIncrement?: boolean
  fields?: {
    STORE_ID?: string
  }
}
const stores: {
  ACTIVE_SEARCH: StoreDefinition
  CARTS: StoreDefinition
  CART_ITEMS: StoreDefinition
  CATEGORIES: StoreDefinition
  CATEGORIES_BRICKLINK: StoreDefinition
  COLORS: StoreDefinition
  INVENTORY_ITEMS: StoreDefinition
  PART_VARIANTS: StoreDefinition
  PARTS: StoreDefinition
  PARTS_BRICK_LINK: StoreDefinition
  PARTS_LEGO: StoreDefinition
  SEARCHES: StoreDefinition
  LISTS: StoreDefinition
  LIST_ITEMS: StoreDefinition
  STORES: StoreDefinition
} = {
  ACTIVE_SEARCH: {
    name: 'activeSearch',
    keyPath: 'id',
    autoIncrement: true
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
  },
  CATEGORIES_BRICKLINK: {
    name: 'categoriesBrickLink',
    keyPath: 'id',
  },
  COLORS: {
    name: 'colors',
    keyPath: 'id',
  },
  INVENTORY_ITEMS: {
    name: 'inventoryItems',
    keyPath: ['storeId', 'invId'],
    fields: {
      STORE_ID: 'storeId'
    }
  },
  PART_VARIANTS: {
    name: 'partVariants',
    keyPath: ['itemId', 'colorId']
  },
  PARTS: {
    name: 'parts',
    keyPath: 'itemId'
  },
  PARTS_BRICK_LINK: {
    name: 'partsBrickLink',
    keyPath: 'brickLinkId'
  },
  PARTS_LEGO: {
    name: 'partsLego',
    keyPath: 'legoId'
  },
  SEARCHES: {
    name: 'searches',
    keyPath: 'id',
    autoIncrement: true
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
  STORES: {
    name: 'stores',
    keyPath: 'sId',
  },
}

export default stores