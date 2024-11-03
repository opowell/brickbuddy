export interface Store {
  sId: string
  name: string
}

export interface Item {
  categoryString: string
  itemId: number
  itemName: string
  itemNo: string
  itemSeq: number
  itemStatus: string
  itemType: string
}
export interface ItemVariant {
  itemId: number
  colorId: number
  largeImg: string
  newItemImg: string
  newThumb1Img: string
  newThumb2Img: string
  smallImg: string
}
export interface UiItemVariant extends ItemVariant {
  color: Color
  invItems: UiInvItem[]
}
export interface UiItem extends Item {
  variants: UiItemVariant[]
}
export interface InvItem {
  invId: number
  storeId: string
  itemId: number
  condition: string
  quantity: number
  price: number
  color: number
}

export interface UiInvItem extends InvItem {
  item: UiItem
  store?: UiStore
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
  itemId: number
  condition: string,
  minQuantity: number,
  maxQuantity: number,
  maxPrice: number,
  colors: string[]
}
export interface UiShopListItem extends ShopListItem {
  item?: UiItem
  colorNames?: Color[]
}
export const DB_NAME = 'brickbuddy'

export interface Color {
  id: number
  name: string
}

export interface Search {
  id: number
  name: string
}

export interface UiShopList extends ShopList {
  items: ShopListItem[]
}

