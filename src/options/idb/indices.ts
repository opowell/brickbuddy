import stores, { StoreDefinition } from './stores'

export interface IndexDefinition {
  store: StoreDefinition
  name: string
  keyPath: string | string[]
}
const indices: {
  BRICK_LINK_STORE_PAGES_BY_NEXT_SCRAPE: IndexDefinition
  STORES_BY_TYPE: IndexDefinition
  STORES_BY_TYPE_AND_LAST_SCRAPED: IndexDefinition
  STORES_BY_TYPE_AND_SLUG: IndexDefinition
  CARTS_BY_ACTIVE: IndexDefinition
  SEARCH_FILTERS_BY_SEARCH: IndexDefinition
  SEARCH_FILTERS_BY_SEARCH_TYPE_OBJECT: IndexDefinition
  SEARCH_CATEGORIES_EXCLUDED: IndexDefinition
  SEARCH_STORES_EXCLUDED: IndexDefinition
  SEARCHES_BY_ACTIVE: IndexDefinition
  CART_ITEMS_BY_CART: IndexDefinition
  EXTERNAL_CATEGORIES_BY_TYPE: IndexDefinition
  EXTERNAL_CATEGORIES_BY_CATEGORY: IndexDefinition
  EXTERNAL_PARTS_BY_PART: IndexDefinition
  EXTERNAL_PARTS_BY_CATEGORY: IndexDefinition
  EXTERNAL_PARTS_BY_TYPE_AND_EXTERNAL_ID: IndexDefinition
  EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY: IndexDefinition
  PART_VARIANTS_BY_TYPE_AND_PART: IndexDefinition
  PART_VARIANTS_BY_PART: IndexDefinition
  PART_VARIANTS_BY_COLOR: IndexDefinition
  PART_VARIANTS_BY_PART_AND_COLOR: IndexDefinition
  INV_ITEMS_BY_ITEM: IndexDefinition
  INV_ITEMS_BY_TYPE_AND_ITEM: IndexDefinition
  INV_ITEMS_BY_TYPE_STORE_ITEM: IndexDefinition
  INV_ITEMS_BY_ITEM_AND_COLOR: IndexDefinition
  INV_ITEMS_BY_STORE: IndexDefinition
  INV_ITEMS_BY_STORE_ITEM: IndexDefinition
  INV_ITEMS_BY_COLORS: IndexDefinition
  INV_ITEMS_BY_CONDITION: IndexDefinition
  SEARCH_CONDITION_PRICE_ADJUSTMENTS_BY_SEARCH: IndexDefinition
  SHOP_LIST_ITEMS_BY_SHOP_LIST: IndexDefinition
  STORES_BY_COUNTRY: IndexDefinition
  COLOR_BY_BRICKLINK_ID: IndexDefinition
  COLOR_BY_LEGO_ID: IndexDefinition
} = {
  BRICK_LINK_STORE_PAGES_BY_NEXT_SCRAPE: {
    store: stores.BRICK_LINK_STORE_PAGES,
    name: 'nextScrape',
    keyPath: 'nextScrape',
  },
  STORES_BY_TYPE_AND_LAST_SCRAPED: {
    store: stores.STORES,
    name: 'typeLastScraped',
    keyPath: ['type', 'lastScraped'],
  },
  STORES_BY_TYPE: {
    store: stores.STORES,
    name: 'type',
    keyPath: 'type',
  },
  STORES_BY_TYPE_AND_SLUG: {
    store: stores.STORES,
    name: 'typeSlug',
    keyPath: ['type', 'slug'],
  },
  STORES_BY_COUNTRY: {
    store: stores.STORES,
    name: 'country',
    keyPath: 'countryId',
  },
  CART_ITEMS_BY_CART: {
    store: stores.CART_ITEMS,
    name: 'cartId',
    keyPath: 'cartId',
  },
  CARTS_BY_ACTIVE: {
    store: stores.CARTS,
    name: 'active',
    keyPath: 'active',
  },
  EXTERNAL_CATEGORIES_BY_TYPE: {
    store: stores.EXTERNAL_CATEGORIES,
    name: 'type',
    keyPath: 'type',
  },
  EXTERNAL_CATEGORIES_BY_CATEGORY: {
    store: stores.EXTERNAL_CATEGORIES,
    name: 'categoryId',
    keyPath: 'categoryId',
  },
  EXTERNAL_PARTS_BY_TYPE_AND_CATEGORY: {
    store: stores.EXTERNAL_PARTS,
    name: 'typeAndCategoryId',
    keyPath: ['type', 'externalCategoryId'],
  },
  EXTERNAL_PARTS_BY_CATEGORY: {
    store: stores.EXTERNAL_PARTS,
    name: 'externalCategoryId',
    keyPath: 'externalCategoryId',
  },
  EXTERNAL_PARTS_BY_PART: {
    store: stores.EXTERNAL_PARTS,
    name: 'partId',
    keyPath: 'itemId',
  },
  EXTERNAL_PARTS_BY_TYPE_AND_EXTERNAL_ID: {
    store: stores.EXTERNAL_PARTS,
    name: 'type + externalId',
    keyPath: ['type', 'externalItemId'],
  },
  SEARCHES_BY_ACTIVE: {
    store: stores.SEARCHES,
    name: 'active',
    keyPath: 'active',
  },
  SEARCH_FILTERS_BY_SEARCH: {
    store: stores.SEARCH_FILTERS,
    name: 'search',
    keyPath: 'searchId',
  },
  SEARCH_FILTERS_BY_SEARCH_TYPE_OBJECT: {
    store: stores.SEARCH_FILTERS,
    name: 'searchTypeObject',
    keyPath: ['searchId', 'type', 'objectId'],
  },
  SEARCH_CATEGORIES_EXCLUDED: {
    store: stores.SEARCH_CATEGORIES,
    name: 'searchCategoriesExcluded',
    keyPath: ['searchId', 'isExcluded'],
  },
  SEARCH_STORES_EXCLUDED: {
    store: stores.SEARCH_STORES,
    name: 'searchStoresExcluded',
    keyPath: ['searchId', 'isExcluded'],
  },
  INV_ITEMS_BY_STORE: {
    store: stores.INVENTORY_ITEMS,
    name: 'store',
    keyPath: 'storeId',
  },
  INV_ITEMS_BY_STORE_ITEM: {
    store: stores.INVENTORY_ITEMS,
    name: 'storeItem',
    keyPath: ['storeId', 'itemId'],
  },
  PART_VARIANTS_BY_PART: {
    store: stores.PART_VARIANTS,
    name: 'part',
    keyPath: 'itemId',
  },
  PART_VARIANTS_BY_TYPE_AND_PART: {
    store: stores.PART_VARIANTS,
    name: 'typePart',
    keyPath: ['type', 'itemId'],
  },
  PART_VARIANTS_BY_PART_AND_COLOR: {
    store: stores.PART_VARIANTS,
    name: 'partColor',
    keyPath: ['itemId', 'colorId'],
  },
  PART_VARIANTS_BY_COLOR: {
    store: stores.PART_VARIANTS,
    name: 'color',
    keyPath: 'colorId',
  },
  INV_ITEMS_BY_ITEM: {
    store: stores.INVENTORY_ITEMS,
    name: 'item',
    keyPath: 'itemId',
  },
  INV_ITEMS_BY_TYPE_AND_ITEM: {
    store: stores.INVENTORY_ITEMS,
    name: 'typeItem',
    keyPath: ['type', 'itemId'],
  },
  INV_ITEMS_BY_TYPE_STORE_ITEM: {
    store: stores.INVENTORY_ITEMS,
    name: 'typeStoreItem',
    keyPath: ['type', 'storeId', 'itemId'],
  },
  INV_ITEMS_BY_ITEM_AND_COLOR: {
    store: stores.INVENTORY_ITEMS,
    name: 'itemColor',
    keyPath: ['itemId', 'colorId'],
  },
  INV_ITEMS_BY_COLORS: {
    store: stores.INVENTORY_ITEMS,
    name: 'color',
    keyPath: 'colorId',
  },
  INV_ITEMS_BY_CONDITION: {
    store: stores.INVENTORY_ITEMS,
    name: 'condition',
    keyPath: 'condition',
  },
  SEARCH_CONDITION_PRICE_ADJUSTMENTS_BY_SEARCH: {
    store: stores.SEARCH_CONDITION_PRICE_ADJUSTMENTS,
    name: 'searchConditionPriceAdjustmentSearch',
    keyPath: 'searchId',
  },
  SHOP_LIST_ITEMS_BY_SHOP_LIST: {
    store: stores.LIST_ITEMS,
    name: 'shopList',
    keyPath: 'listId',
  },
  COLOR_BY_BRICKLINK_ID: {
    store: stores.COLORS,
    name: 'brickLinkId',
    keyPath: 'brickLinkId',
  },
  COLOR_BY_LEGO_ID: {
    store: stores.COLORS,
    name: 'legoId',
    keyPath: 'legoId',
  },
}

export default indices
