import { IDBPDatabase } from "idb"
import { ActiveCartButtonCart, Cart, CartsPageCart, CartItem, CartPageCartItem, InvItem, CartWithItems, StorePageInvItem, Store } from "../types"
import { put, getAllFromIndex, getFromIndex, getAll } from "./db"
import { getDbConnection } from "./idb"
import { getActiveCart, getActiveSearch } from "./searches"
import { getItemVariant } from "./variants"
import STORES from './stores'
import INDICES from './indices'
import ObjectCacheClass from './ObjectCacheClass'
import { getScore } from "../utils"

export async function addCart() {
  const db = await getDbConnection()
  return put(db, STORES.CARTS, {
    name: new Date().toISOString(),
    active: 0,
  })
}

export async function getActiveCartButtonCart(): Promise<ActiveCartButtonCart> {
  const cart = await getActiveCart()
  let totalCost = 0
  let totalQuantity = 0
  cart.cartItems.forEach((i) => {
    totalCost += i.price * i.quantity
    totalQuantity += i.quantity
  })
  totalCost = totalCost / 100
  const activeCart: ActiveCartButtonCart = {
    ...cart,
    totalCost,
    totalItems: cart.cartItems.length,
    totalQuantity
  }
  return activeCart
}

export async function getActiveCarts(db: IDBPDatabase): Promise<Cart[]> {
  return await getAllFromIndex(db, INDICES.CARTS_BY_ACTIVE, 1)
}
export async function getFirstActiveCart(db: IDBPDatabase): Promise<Cart | undefined> {
  return await getFromIndex(db, INDICES.CARTS_BY_ACTIVE, 1)
}
export async function setActiveCart(cart: Cart) {
  const db = await getDbConnection()
  const activeCarts: Cart[] = await getActiveCarts(db)
  for (let i = 0; i < activeCarts.length; i++) {
    const ac = activeCarts[i]
    ac.active = 0
    await put(db, STORES.CARTS, ac)
  }
  cart.active = 1
  await put(db, STORES.CARTS, cart)
}

export async function getCartPageCart(cartId: number) {
  return await getActiveCart()
}
export async function getAllCarts(db: IDBPDatabase): Promise<Cart[]> {
  return await getAll(db, STORES.CARTS)
}
export async function getCartsPageCarts(): Promise<CartsPageCart[]> {
  const db = await getDbConnection()
  const carts = await getAllCarts(db)
  return await Promise.all<CartsPageCart>(carts.map(async cart => {
    const cartItems = await getCartItems(db, cart)
    return {
      ...cart,
      numStores: cartItems.map(cartItem => cartItem.storeId).filter(onlyUnique).length,
      numInvItems: cartItems.length,
      quantity: sum(cartItems, (cartItem: CartItem) => cartItem.quantity),
      cost: sum(cartItems, (cartItem: CartItem) => cartItem.quantity * cartItem.price),
    }
  }))
}

export async function getCartItems(db: IDBPDatabase, cart: Cart): Promise<CartItem[]> {
  return getAllFromIndex(db, INDICES.CART_ITEMS_BY_CART, cart.id)
}

export async function getCartPageCartItem(objectCache: ObjectCacheClass, cartItem: CartItem): Promise<CartPageCartItem | undefined> {
  const search = await getActiveSearch()
  const invItem: InvItem | undefined = await objectCache.getInvItem(cartItem.storeId, cartItem.invItemId)
  if (!invItem) {
    return
  }
  const store = await objectCache.getStore(invItem.storeId)
  if (!store) {
    return
  }
  const part = await objectCache.getStorePagePart(invItem.itemId)
  if (!part) {
    return
  }
  const color = await objectCache.getColor(invItem.colorId)
  if (!color) {
    return
  }
  const category = await objectCache.getCategory(part.categoryId)
  if (!category) {
    return
  }
  const variant = await getFromIndex(objectCache.db, INDICES.PART_VARIANTS_BY_PART_AND_COLOR, [part.itemId, color.id])
  const variant2 = await getItemVariant(objectCache.db, invItem.itemId, invItem.colorId)
  if (!variant2) {
    return
  }
  let allMatchingInvItems
  if (search.priceScoreIgnoreColor) {
    allMatchingInvItems= await getAllFromIndex(objectCache.db, INDICES.INV_ITEMS_BY_ITEM, part.itemId)
  } else {
    allMatchingInvItems= await getAllFromIndex(objectCache.db, INDICES.INV_ITEMS_BY_ITEM_AND_COLOR, [part.itemId, color.id])
  } 
  if (!search) {
    return
  }
  const priceScoreString = getScore(allMatchingInvItems, search.priceScoreQuantity, invItem.price, true)
  return {
    ...cartItem,
    invItem,
    item: part,
    store,
    color,
    category,
    variant,
    variant2,
    priceScore: priceScoreString,
  }
}

export function getCartQuantity(cart: CartWithItems, invItem: InvItem): number {
  const cartItem = cart.cartItems.find(i => i.invItemId === invItem.invId && i.storeId === invItem.storeId)
  if (!cartItem) {
    return 0
  }
  return cartItem.quantity
}

export async function setCartQuantity(store: Store, invId: string, price: string, newQuantity: number): Promise<boolean> {
  const activeCart = await getActiveCart()
  const db = await getDbConnection()
  let foundItem: CartItem = await db.get(STORES.CART_ITEMS.name, [activeCart.id, store.id, invId])
  if (!foundItem) {
    foundItem = {
      cartId: activeCart.id,
      invItemId: invId,
      storeId: store.id,
      quantity: 0,
      price,
      lastUpdated: new Date()
    }
  }
  foundItem.quantity = newQuantity
  foundItem.lastUpdated = new Date()
  if (foundItem.quantity === 0) {
    await db.delete(STORES.CART_ITEMS.name, [activeCart.id, store.id, invId])
  } else {
    await db.put(STORES.CART_ITEMS.name, foundItem)
  }
  await storeActiveCart(db, activeCart)
  return true
}

export async function storeActiveCart(db: IDBPDatabase, activeCart: Cart) {
  return await put(db, STORES.CARTS, activeCart)
}

