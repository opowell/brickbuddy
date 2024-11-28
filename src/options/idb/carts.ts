import { IDBPDatabase } from "idb"
import * as math from "mathjs"
import { ActiveCartButtonCart, Cart, CartsPageCart, CartItem, CartPageCartItem, InvItem, CartWithItems, StorePageInvItem, Store } from "../types"
import { put, getAllFromIndex, getFromIndex, getAll } from "./db"
import { getDbConnection } from "./idb"
import { getActiveCart, getActiveSearch } from "./searches"
import { getItemVariant } from "./variants"
import STORES from './stores'
import INDICES from './indices'
import ObjectCacheClass from './ObjectCacheClass'

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
export async function getCartsPageCarts(): Promise<CartsPageCart[]> {
  const db = await getDbConnection()
  const carts = await getAll(db, STORES.CARTS)
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
  console.log(invItem, cartItem)
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
  const sortedItems = allMatchingInvItems.sort((a, b) => a.price - b.price)
  const targetQ = search.priceScoreQuantity
  let cost = 0
  let quantity = 0
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i]
    const toTake = Math.min(item.quantity, targetQ - quantity)
    try {
      quantity += toTake
      cost += item.price * toTake
    } catch (e) {
      console.log(e)
    }
    if (toTake >= targetQ) {
      break
    }
  }
  const cheapestPrice = cost / quantity
  console.log(invItem.itemId, cost, quantity, cheapestPrice)
  const priceScore = math.number(math.divide(math.bignumber(invItem.price), math.bignumber(cheapestPrice)))
  const percent = math.number(math.multiply(100, math.number(math.subtract(priceScore, 1))))
  let sign = ''
  if (percent > 0) {
    sign = '+'
  }
  const priceScoreString = sign + percent.toFixed(2) + '%'
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

export async function setCartQuantity(store: Store, invItem: StorePageInvItem, newQuantity: number): Promise<boolean> {
  const activeCart = await getActiveCart()
  const db = await getDbConnection()
  let foundItem: CartItem = await db.get(STORES.CART_ITEMS.name, [activeCart.id, store.sId, invItem.invId])
  if (!foundItem) {
    foundItem = {
      cartId: activeCart.id,
      invItemId: invItem.invId,
      storeId: store.sId,
      quantity: 0,
      price: invItem.price,
      lastUpdated: new Date()
    }
  }
  foundItem.quantity = newQuantity
  foundItem.lastUpdated = new Date()
  if (foundItem.quantity === 0) {
    await db.delete(STORES.CART_ITEMS.name, [activeCart.id, store.sId, invItem.invId])
  } else {
    await db.put(STORES.CART_ITEMS.name, foundItem)
  }
  await storeActiveCart(db, activeCart)
  return true
}

export async function storeActiveCart(db: IDBPDatabase, activeCart: Cart) {
  return await put(db, STORES.CARTS, activeCart)
}

