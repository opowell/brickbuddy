import { IDBPDatabase } from "idb";
import { Color, Store } from "../types";
import { addCategory, addInvItem, addItem, getFromIndex, updateStore } from "./idb";
import * as math from 'mathjs'
import INDICES from './indices'

async function getColorByBrickLinkId(db: IDBPDatabase, brickLinkId: string): Promise<Color> {
  return getFromIndex(db, INDICES.COLOR_BY_BRICKLINK_ID, brickLinkId)
}

export async function getBrickLinkPrices(db: IDBPDatabase, store: Store) {
    const response = await fetch(`https://store.bricklink.com/ajax/clone/store/searchitems.ajax?sort=6&pgSize=100&pg=${store.fetchPageIndex}&showHomeItems=0&sid=${store.sId}`, {
  "headers": {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en,de;q=0.9,es;q=0.8,en-US;q=0.7",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },
  "referrer": "https://store.bricklink.com/" + store.slug + "?p=" + store.slug,
  "referrerPolicy": "no-referrer-when-downgrade",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});
  store.fetchPageIndex++
  store.lastScraped = new Date()
  if (store.fetchPageIndex >= store.fetchMaxPageIndex) {
    store.fetchPageIndex = 1
  }
  const json = await response.json()
  if (!json?.result) {
    updateStore(db, store)
    return
  }
  store.fetchMaxPageIndex = Math.ceil(json.result.totalLotCnt / 100) + 1
  updateStore(db, store)
  for (let i = 0; i < json.result.categories.length; i++) {
    const category = json.result.categories[i]
    if (category.type !== 'P') {
      continue
    }
    for (let j = 0; j < category.categories.length; j++) {
      const cat = category.categories[j]
      await addCategory(db, cat.catstr, cat.name)
    }
  }
  for (let i = 0; i < json.result.groups.length; i++) {
    const group = json.result.groups[i]
    for (let j = 0; j < group.items.length; j++) {
      const invItem = group.items[j]
      try {
        const color: Color = await getColorByBrickLinkId(db, invItem.colorID)
        await addItem(
          invItem.categoryString,
          color?.id || invItem.colorID,
          invItem.itemID,
          invItem.itemName,
          invItem.itemNo,
          invItem.itemSeq,
          invItem.itemStatus,
          invItem.itemType,
          invItem.newThumb1Img,
          db
        )
        await addInvItem(
          db,
          invItem.invID,
          store,
          invItem.colorID,
          invItem.invNew,
          invItem.invQty,
          math.number(math.multiply(math.bignumber(100), math.bignumber(invItem.rawConvertedPrice))),
          invItem.itemID,
        )
      } catch (e) {
        console.log('error adding item', invItem, e)
      }
    }
  }
}