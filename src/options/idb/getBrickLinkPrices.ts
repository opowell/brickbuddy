import { IDBPDatabase } from "idb";
import { BrickLinkCategory, BrickLinkItem, Category, Color, ExternalItem, Item, Store } from "../types";
import * as math from 'mathjs'
import INDICES from './indices'
import { addBrickLinkCategory, getBrickLinkCategory, getCategory, updateCategory } from "./categories";
import { getFromIndex } from "./db";
import { addInvItem } from "./invItems";
import { getBrickLinkItem, addBrickLinkItem } from "./parts";
import { updateStore } from "./storeMethods";

async function getColorByBrickLinkId(db: IDBPDatabase, brickLinkId: string): Promise<Color> {
  return getFromIndex(db, INDICES.COLOR_BY_BRICKLINK_ID, brickLinkId + '')
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
    await updateStore(db, store)
    return
  }
  store.fetchMaxPageIndex = Math.ceil(json.result.totalLotCnt / 100) + 1
  await updateStore(db, store)
  const partCategories = json.result.categories.find((c: { type: string }) => c.type === 'P')
  const blCategories = new Map<string, string>()
  if (partCategories) {
    for (let i = 0; i < partCategories.categories.length; i++) {
      const partCategory = partCategories.categories[i]
      // blCategories[partCategory.id + ''] = partCategory.name + ''
      blCategories.set(partCategory.catstr, partCategory.name)
    }
  }
  for (let i = 0; i < json.result.groups.length; i++) {
    const group = json.result.groups[i]
    for (let j = 0; j < group.items.length; j++) {
      const resultItem = group.items[j]
      try {
        const color: Color = await getColorByBrickLinkId(db, resultItem.colorID)
        if (!color) {
          console.log('no color!!', resultItem.colorID, resultItem)
          continue
        }
        const blItem: BrickLinkItem | undefined = await getBrickLinkItem(db, resultItem.itemNo + '')
        if (!blItem) {
          continue
        }
        const item: Item = blItem.part
        if (!item) {
          continue
        }
        delete blItem.part
        blItem.name = resultItem.itemName
        blItem.categoryId = resultItem.categoryString
        const brickLinkCategory: BrickLinkCategory = await getBrickLinkCategory(db, blItem.categoryId)
        if (!brickLinkCategory) {
          const blCategoryName = blCategories.get(resultItem.categoryString)
          if (!blCategoryName) {
            console.log('NO BL NAME!', blItem, blCategories, resultItem.categoryString)
            continue
          }
          await addBrickLinkCategory(db, blItem.categoryId, blCategoryName)
        }
        blItem.name = resultItem.itemName
        await addBrickLinkItem(
          color.id,
          blItem,
          item,
          resultItem.newThumb1Img,
          db
        )
        await addInvItem(
          db,
          resultItem.invID + '',
          store,
          color.id,
          resultItem.invNew,
          resultItem.invQty,
          math.number(math.multiply(math.bignumber(100), math.bignumber(resultItem.rawConvertedPrice))),
          blItem.externalItemId,
        )
      } catch (e) {
        console.log('error adding item', resultItem, e)
      }
    }
  }
}