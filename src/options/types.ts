export interface Cart {
  id: number
  name: string
}

export interface CartWithItems extends Cart {
  cartItems: CartItem[]
}

export interface CartItem {
  cartId: number
  storeId: string
  invItemId: string
  quantity: number
  price: number
}

export interface CartPageCartItem extends CartItem {
  id: string
  store: Store
  priceScore: number
  image: string
  part: Item
  condition: string
  color: Color
  maxQuantity: number
  category: Category
}

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

export interface HomeData {
  stores: number
  categories: number
  colors: number
  parts: number
  conditions: number
  lists: number
  searches: number
  carts: number
}
export enum StoreType {
  BrickLink,
  Lego
}
export interface Store extends AddNewStore {
  fetchPageIndex: number
  fetchMaxPageIndex: number
  shippingCosts: ShippingCost[]
  slug: string
  priceAdjustment: number
  lastScraped: Date
  type: StoreType
}

export interface BrickLinkItem {
  brickLinkId: string
  name: string
  partId: string
  part?: Item
}
export interface LegoItem {
  legoId: string
  name: string
  partId: string
  part?: Item
}
export interface Item {
  categoryId: string
  itemId: string
  itemName: string
  legoPartIds?: string[]
  brickLinkIds?: string[]
}
export interface StorePageInvItemItem extends Item {
  variants: ItemVariant[]
}
export interface ItemVariant {
  itemId: string
  colorId: string
  image: string
}
export interface PartsPageVariant extends ItemVariant {
  item: Item
  color: Color
  invItems: PartsPageVariantInvItem[]
}

export interface ObjectCache {
  categories: Map<string, Category>
  colors: Map<string, UiColor>
}

export interface UiItemVariant extends ItemVariant {
  color: Color
  invItems: UiInvItem[]
  item?: UiItem
}
export interface VariantPageVariant extends ItemVariant {
  color: Color
  invItems: VariantPageInvItem[]
  item?: VariantPagePart
}
export interface VariantPageInvItem extends InvItem {
  store: Store
  item: Item
  cartQuantity: number
}
export interface PartVariantButtonVariant extends ItemVariant {
  color: Color
}
export interface StorePageVariant extends ItemVariant {
  color: Color
  invItems: UiInvItem[]
  item?: UiItem
}
export interface PartPageVariant extends ItemVariant {
  color: Color
  invItems: PartPageVariantInvItem[]
  item?: UiItem
}
export interface PartPageVariantInvItem extends InvItem {
  store: Store
  color: Color
  cartQuantity: number
}
export interface UiItem extends Item {
  variants: UiItemVariant[]
  category?: Category
}
export interface VariantPagePart extends Item {
  variants: ItemVariant[]
  category?: Category
}
export interface PartsPagePart extends Item {
  variants: PartsPageVariant[]
  category?: Category
}
export interface StorePagePart extends Item {
  variants: UiItemVariant[]
  category: Category
}
export interface PartPagePart extends Item {
  variants: PartPageVariant[]
  invItems: PartPageVariantInvItem[]
  category: Category
}
export interface InvItem {
  invId: string
  storeId: string
  itemId: string
  condition: string
  quantity: number
  price: number
  colorId: string
  condition_New: number
  condition_Used: number
}

export interface UiInvItem extends InvItem {
  item: UiItem
  store?: UiStore
  colorName: string
}

export interface PartsPageVariantInvItem extends InvItem {
}

export interface StorePageInvItem extends InvItem {
  item: StorePageInvItemItem
  colorName: string
  category: Category
  variant: ItemVariant
  cartQuantity: number
  priceScore: number
}

export interface ColorPageInvItem extends InvItem {
  variant: ItemVariant
  item: Item
  store?: Store
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
export interface StorePageStore extends Store {
  items: InvItem[]
  objectCache: ObjectCache
}
export interface ShopList {
  id?: number
  name: string
}
export interface ShopListItem {
  id?: number
  listId: number
  itemId: string
  condition: string
  minQuantity: number
  maxQuantity: number
  maxPrice: number
  colors: string[]
}
export interface SearchBase {
  categories: {
    included: string[]
    excluded: string[]
  }
  colors: {
    included: string[]
    excluded: string[]
  }
  conditions: {
    included: string[]
    excluded: string[]
  }
  stores: {
    included: string[]
    excluded: string[]
  }
  parts: {
    included: string[]
    excluded: string[]
  }
  priceScoreQuantity: number
  priceScoreIgnoreColor: boolean
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
export interface ActiveCartButtonCart extends Cart {
  totalCost: number
  totalItems: number
  totalQuantity: number
}
export interface ActiveSearchButtonActiveSearch extends ActiveSearch {
  categories: {
    included: string[]
    excluded: string[]
    includedNames: string[]
    excludedNames: string[]
  }
  colors: {
    included: string[]
    excluded: string[]
    includedNames: string[]
    excludedNames: string[]
  }
  parts: {
    included: string[]
    excluded: string[]
    includedNames: string[]
    excludedNames: string[]
  }
  stores: {
    included: string[]
    excluded: string[]
    includedNames: string[]
    excludedNames: string[]
  }
  conditions: {
    included: string[]
    excluded: string[]
    includedNames: string[]
    excludedNames: string[]
  }
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
  listItems?: UiListItem[]
}
export interface SearchesPageSearch extends Search {

}
export interface UiListItem extends ShopListItem {
  item?: UiItem
  colorNames?: Color[]
  shopList?: UiShopList
}

export interface Color {
  id: string
  name: string
  brickLinkName?: string
  brickLinkId?: string
  legoName?: string
  legoId?: string
}

export interface RbColor {
  Img: string
  ID: number
  Name: string
  RGB: string
  "Num Parts": number
  "Num Sets": number
  "First Year": number | null
  "Last Year": number | null
  LEGO: string
  LDraw: string
  BrickLink: string
  BrickOwl: string
}

export interface ColorPageColor extends Color {
  invItems?: ColorPageInvItem[]
}

export interface UiColor extends Color {
  numInvItems?: number
  invItems?: UiInvItem[]
  image?: string
}

export interface ColorsPageColor extends Color {
  numInvItems?: number
  invItems?: UiInvItem[]
  image?: string
}

export interface Category {
  id: string
  name: string
  brickLinkId?: string
  brickLinkName?: string
  legoId?: string
  legoName?: string
}

export interface CategoryPagePart extends Item {
  numInvItems: number
}

export interface CategoryPageCategory extends Category {
  parts: CategoryPagePart[]
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

