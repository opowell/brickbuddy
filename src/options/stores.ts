interface StoreDefinition {
  name: string
  keyPath: string | string[]
  autoIncrement?: boolean
  fields?: {
    STORE_ID?: string
  }
}
const stores: {
  CATEGORIES: StoreDefinition
  COLORS: StoreDefinition
  INVENTORY_ITEMS: StoreDefinition
  PART_VARIANTS: StoreDefinition
  PARTS: StoreDefinition
  SEARCHES: StoreDefinition
  SHOP_LISTS: StoreDefinition
  SHOP_LIST_ITEMS: StoreDefinition
  STORES: StoreDefinition
} = {
  CATEGORIES: {
    name: 'categories',
    keyPath: 'id',
    autoIncrement: true
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
  SEARCHES: {
    name: 'searches',
    keyPath: 'id',
    autoIncrement: true
  },
  SHOP_LISTS: {
    name: 'shopLists',
    keyPath: 'id',
    autoIncrement: true
  },
  SHOP_LIST_ITEMS: {
    name: 'shopListItems',
    keyPath: ['shopListId', 'itemId', 'colors']
  },
  STORES: {
    name: 'stores',
    keyPath: 'sId',
  },
}

export default stores