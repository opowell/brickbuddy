import { ActiveSearchPageSearch } from './types';
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
  category?: Category
}
export interface InvItem {
  invId: number
  storeId: string
  itemId: string
  condition: string
  quantity: number
  price: number
  color: number
  condition_New: number
  condition_Used: number
}

export interface UiInvItem extends InvItem {
  item: UiItem
  store?: UiStore
  colorName: string
}

export interface ColorPageInvItem extends InvItem {
  variant: ItemVariant
  item: Item
  store?: UiStore
  colorName: string
}

export interface ConditionsPageCondition {
  id: string
  numInvItems: number
}
export interface StoresPageStore extends Store {
  numInvItems: number
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
export interface SearchBase {
  categories: {
    ids: string[]
    excluded: boolean
  }
  colors: {
    ids: number[]
    excluded: boolean
  }
  conditions: {
    ids: string[]
    excluded: boolean
  }
  stores: {
    ids: string[]
    excluded: boolean
  }
  parts: {
    ids: number[]
    excluded: boolean
  }
}
export interface Search extends SearchBase {
  id: number
  name: string
  shoppingListId?: number
  shopListItemIds?: number[]
  storeIds: string[]
}
export interface ActiveSearch extends SearchBase {
  linkedSearch?: string
}
interface ActiveSearchPagePart extends Item {
  numVariants: number
}
interface ActiveSearchPageStore extends Store {
  numParts: number
}
export interface ActiveSearchPageCondition {
  id: string
  numInvItems: number
}
export interface ActiveSearchPageSearch extends ActiveSearch {
  conditionObjects: ActiveSearchPageCondition[] 
  categoryObjects: CategoriesPageCategory[] 
  colorObjects: UiColor[] 
  partObjects: ActiveSearchPagePart[] 
  storeObjects: ActiveSearchPageStore[] 
}
export interface UiSearch extends Search {
  shoppingList?: UiShopList
  shopListItems?: UiShopListItem[]
}
export interface SearchesPageSearch extends Search {

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

export interface ColorPageColor extends Color {
  invItems?: ColorPageInvItem[]
}

export interface UiColor extends Color {
  numInvItems?: number
  invItems?: UiInvItem[]
}

export interface Category {
  id: string
  name: string
}

export interface CategoryPageCategory extends Category {
  parts: UiItem[]
}

export interface CategoriesPageCategory extends Category {
  numParts: number
  image?: string
}

export interface UiCategory extends Category {
  parts?: UiItem[]
  numParts: number
}

export interface UiShopList extends ShopList {
  items: ShopListItem[]
}

