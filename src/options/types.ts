export interface Cart {
  id: number | IDBValidKey
  name: string
  active?: number
}

export interface CartWithItems extends Cart {
  cartItems: CartItem[]
}

export interface CartsPageCart extends Cart {
  numStores: number
  numInvItems: number
  quantity: number
  cost: number
}

export interface CartItem {
  cartId: number | IDBValidKey
  storeId: string
  invItemId: string
  quantity: number
  price: string
  lastUpdated: Date
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
  invItem: InvItem
  variant: ItemVariant
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

export interface BrickLinkItem extends ExternalItem {
  type: "BrickLink"
}
export interface LegoItem extends ExternalItem {
  type: "Lego"
}

export interface LegoCategory extends ExternalCategory {
  type: 'Lego'
}
export interface Item {
  itemId: number
}
export interface PartPageCategory extends Category {

}
export interface PartButtonPart extends Item {
  itemId: number
  externalParts: ExternalItem[]
}
export interface RebrickableItem extends ExternalItem {
  legoPartIds: string[] | undefined
  brickLinkIds: string[] | undefined
  type: "Rebrickable"
}
export interface ExternalItem {
  externalCategoryId: string
  itemId: number
  externalItemId: string
  name?: string
  type: 'Rebrickable' | 'Lego' | 'BrickLink'
}
export interface StorePageInvItemItem extends ExternalItem {
  variants: ItemVariant[]
  color: UiColor
}
export interface ItemVariant {
  itemId: string
  colorId: string
  image: string
  type: 'Rebrickable' | 'Lego' | 'BrickLink'
}
export interface StorePageItemVariant extends ItemVariant {
  color: UiColor
  invItems: InvItem[]
}
export interface PartsPageVariant extends ItemVariant {
  item: ExternalItem
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
  invItems: InvItem[]
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
  externalItems: ExternalItem[]
}
export interface StorePagePart extends Item {
  variants: UiItemVariant[]
  category: Category
}
export interface PartPagePart extends Item {
  variants: PartPageVariant[]
  invItems: PartPageVariantInvItem[]
  externalParts: ExternalItem[]
}
export interface InvItem {
  invId: string
  storeId: string
  itemId: string
  condition: string
  quantity: number
  price: string
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

export interface StorePageExternalPart extends ExternalItem {
  
}

export interface StorePageInvItem extends InvItem {
  item: StorePageInvItemItem
  colorName: string
  category: CategoryWithExternals
  variant: ItemVariant
  cartQuantity: number
  priceScore: string
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
export interface SearchFilter {
  searchId: IDBValidKey
  type: 'category' | 'color' | 'store' | 'condition'
  objectId: string | number
  isExcluded: boolean
}
export interface Search {
  id: IDBValidKey | string
  name: string
  active: number
  filters?: SearchFilter[]
  priceScoreQuantity: number
  priceScoreIgnoreColor: boolean
}
export interface ActiveSearch extends Search {
  categories: {
    included: number[]
    excluded: number[]
  }
  colors: {
    included: number[]
    excluded: number[]
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
    included: number[]
    excluded: number[]
  }
}
export interface CartPageCart extends CartWithItems {

}
export interface ActiveCartButtonCart extends Cart {
  totalCost: number
  totalItems: number
  totalQuantity: number
}
export interface ActiveSearchButtonActiveSearch extends ActiveSearch {
  categories: {
    included: number[]
    excluded: number[]
    includedNames: string[]
    excludedNames: string[]
  }
  colors: {
    included: number[]
    excluded: number[]
    includedNames: string[]
    excludedNames: string[]
  }
  parts: {
    included: number[]
    excluded: number[]
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
export interface SearchPageSearch extends ActiveSearch {
  includedConditionObjects: ActiveSearchPageCondition[] 
  excludedConditionObjects: ActiveSearchPageCondition[] 
  includedCategoryObjects: CategoriesPageCategory[] 
  excludedCategoryObjects: CategoriesPageCategory[] 
  colorObjects: UiColor[] 
  partObjects: ActiveSearchPagePart[] 
  storeObjects: ActiveSearchPageStore[]
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
  id: number
}

export interface BrickLinkCategory extends ExternalCategory {
  type: "BrickLink"
}

export interface CategoryWithExternals extends Category {
  externalCategories: ExternalCategory[]
}

export interface ExternalCategory {
  id: string
  name: string
  categoryId: number
  type: 'BrickLink' | 'Lego' | 'Rebrickable'
}

export interface CategoryPagePart extends Item {
  numInvItems: number
  numVariants: number
  externalParts: ExternalItem[]
  image?: string
}

export interface CategoryPageCategory extends Category {
  parts: CategoryPagePart[]
  externalCategories: ExternalCategory[]
}

export interface CategoriesPageCategory extends CategoryWithExternals {
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

