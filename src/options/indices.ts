import stores from "./stores"

export interface IndexDefinition {
  store: string,
  name: string
  keyPath: string | string[]
}
const indices: {
  PARTS_BY_CATEGORY: IndexDefinition
  PART_VARIANTS_BY_PART: IndexDefinition
  INV_ITEMS_BY_ITEM_AND_COLOR: IndexDefinition
  INV_ITEMS_BY_STORE: IndexDefinition
  INV_ITEMS_BY_COLORS: IndexDefinition
  SHOP_LIST_ITEMS_BY_SHOP_LIST: IndexDefinition
} = {
  INV_ITEMS_BY_STORE: {
    store: stores.INVENTORY_ITEMS.name,
    name: 'inventoryItemsByStore',
    keyPath: 'storeId'
  },
  PARTS_BY_CATEGORY: {
    store: stores.PARTS.name,
    name: 'partsByCategory',
    keyPath: 'categoryString'
  },
  PART_VARIANTS_BY_PART: {
    store: stores.PART_VARIANTS.name,
    name: 'partVariantsByPart',
    keyPath: 'itemId'
  },
  INV_ITEMS_BY_ITEM_AND_COLOR: {
    store: stores.INVENTORY_ITEMS.name,
    name: 'inventoryItemsByItemAndColor',
    keyPath: ['itemId', 'colorId']
  },
  INV_ITEMS_BY_COLORS: {
    store: stores.INVENTORY_ITEMS.name,
    name: 'inventoryItemsByColor',
    keyPath: ['itemId', 'color']
  },
  SHOP_LIST_ITEMS_BY_SHOP_LIST: {
    store: stores.SHOP_LIST_ITEMS.name,
    name: 'shopListItemsByShopList',
    keyPath: 'shopListId'
  }
}

export default indices