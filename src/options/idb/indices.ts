import stores from "./stores"

export interface IndexDefinition {
  store: string,
  name: string
  keyPath: string | string[]
}
const indices: {
  STORES_BY_TYPE_AND_LAST_SCRAPED: IndexDefinition
  PARTS_BY_CATEGORY: IndexDefinition
  PARTS_BY_BRICKLINK_ID: IndexDefinition
  PARTS_BY_LEGO_ID: IndexDefinition
  PART_VARIANTS_BY_PART: IndexDefinition
  PART_VARIANTS_BY_COLOR: IndexDefinition
  PART_VARIANTS_BY_PART_AND_COLOR: IndexDefinition
  INV_ITEMS_BY_ITEM: IndexDefinition
  INV_ITEMS_BY_ITEM_AND_COLOR: IndexDefinition
  INV_ITEMS_BY_STORE: IndexDefinition
  INV_ITEMS_BY_COLORS: IndexDefinition
  INV_ITEMS_BY_CONDITION: IndexDefinition
  SHOP_LIST_ITEMS_BY_SHOP_LIST: IndexDefinition
  COLOR_BY_BRICKLINK_ID: IndexDefinition
  COLOR_BY_LEGO_ID: IndexDefinition
} = {
  STORES_BY_TYPE_AND_LAST_SCRAPED: {
    store: stores.STORES.name,
    name: 'typeLastScraped',
    keyPath: ['type', 'lastScraped']
  },
  INV_ITEMS_BY_STORE: {
    store: stores.INVENTORY_ITEMS.name,
    name: 'store',
    keyPath: 'storeId'
  },
  PARTS_BY_CATEGORY: {
    store: stores.PARTS.name,
    name: 'category',
    keyPath: 'categoryId'
  },
  PARTS_BY_BRICKLINK_ID: {
    store: stores.PARTS.name,
    name: 'brickLinkId',
    keyPath: 'brickLinkId'
  },
  PARTS_BY_LEGO_ID: {
    store: stores.PARTS.name,
    name: 'legoId',
    keyPath: 'legoId'
  },
  PART_VARIANTS_BY_PART: {
    store: stores.PART_VARIANTS.name,
    name: 'part',
    keyPath: 'itemId'
  },
  PART_VARIANTS_BY_PART_AND_COLOR: {
    store: stores.PART_VARIANTS.name,
    name: 'partColor',
    keyPath: ['itemId', 'colorId']
  },
  PART_VARIANTS_BY_COLOR: {
    store: stores.PART_VARIANTS.name,
    name: 'color',
    keyPath: 'colorId'
  },
  INV_ITEMS_BY_ITEM: {
    store: stores.INVENTORY_ITEMS.name,
    name: 'item',
    keyPath: 'itemId'
  },
  INV_ITEMS_BY_ITEM_AND_COLOR: {
    store: stores.INVENTORY_ITEMS.name,
    name: 'itemColor',
    keyPath: ['itemId', 'colorId']
  },
  INV_ITEMS_BY_COLORS: {
    store: stores.INVENTORY_ITEMS.name,
    name: 'color',
    keyPath: 'colorId'
  },
  INV_ITEMS_BY_CONDITION: {
    store: stores.INVENTORY_ITEMS.name,
    name: 'condition',
    keyPath: 'condition'
  },
  SHOP_LIST_ITEMS_BY_SHOP_LIST: {
    store: stores.LIST_ITEMS.name,
    name: 'shopList',
    keyPath: 'listId'
  },
  COLOR_BY_BRICKLINK_ID: {
    store: stores.COLORS.name,
    name: 'brickLinkId',
    keyPath: 'brickLinkId'
  },
  COLOR_BY_LEGO_ID: {
    store: stores.COLORS.name,
    name: 'legoId',
    keyPath: 'legoId'
  }
}

export default indices