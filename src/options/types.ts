export interface ShippingCost {
  region?: string
  minOrderPrice?: number
  maxOrderPrice?: number
  cost: number
  maxWeight?: number
  type?: 'eco' | 'priority'
}
export interface AddNewStore {
  sId: string
  name: string
}
export interface Store extends AddNewStore {
  fetchPageIndex: number
  fetchMaxPageIndex: number
  shippingCosts: ShippingCost[]
  slug: string
  priceAdjustment: number
  lastScraped: Date
}

export interface Item {
  categoryString: string
  itemId: string
  itemName: string
  itemNo?: string
  itemSeq?: number
  itemStatus?: string
  itemType?: string
}
export interface ItemVariant {
  itemId: string
  colorId: number
  image: string
}
export interface UiItemVariant extends ItemVariant {
  color: Color
  invItems: UiInvItem[]
  item?: UiItem
}
export interface UiItem extends Item {
  variants: UiItemVariant[]
}
export interface InvItem {
  invId: number
  storeId: string
  itemId: string
  condition: string
  quantity: number
  price: number
  color: number
}

export interface UiInvItem extends InvItem {
  item: UiItem
  store?: UiStore
  colorName: string
}

export interface UiStore extends Store {
  items: UiInvItem[]
}
export interface ShopList {
  id?: number
  name: string
}
export interface ShopListItem {
  id?: number
  shopListId: number
  itemId: string
  condition: string
  minQuantity: number
  maxQuantity: number
  maxPrice: number
  colors: string[]
}
export interface Search {
  id?: number
  name: string
  shoppingListId?: number
  shopListItemIds?: number[]
  storeIds: string[]
}
export interface UiSearch extends Search {
  shoppingList?: UiShopList
  stores?: UiStore[]
  shopListItems?: UiShopListItem[]
}
export interface UiShopListItem extends ShopListItem {
  item?: UiItem
  colorNames?: Color[]
  shopList?: UiShopList
}

export interface Color {
  id: number
  name: string
}

export interface Category {
  id: string
  name: string
}

export interface UiCategory extends Category {
  parts?: UiItem[]
  numParts: number
}

export interface UiShopList extends ShopList {
  items: ShopListItem[]
}

