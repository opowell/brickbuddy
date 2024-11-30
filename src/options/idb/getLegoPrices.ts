import { IDBPDatabase } from "idb";
import { Category, Color, ExternalCategory, Item, LegoCategory, LegoItem, Store } from "../types";
import INDICES from './indices'
import { addCategory, getCategory, getLegoCategory, putExternalCategory, updateCategory } from "./categories";
import { getFromIndex } from "./db";
import { addInvItem } from "./invItems";
import { getLegoItem, addLegoItem } from "./parts";
import { updateStore } from "./storeMethods";

async function getColorByLegoId(db: IDBPDatabase, legoId: string | number): Promise<Color> {
  legoId = legoId.toString()
  return getFromIndex(db, INDICES.COLOR_BY_LEGO_ID, legoId)
}

export async function getLegoPrices(db: IDBPDatabase, store: Store) {
  let referrer = `https://www.lego.com/de-at/pick-and-build/pick-a-brick`
  if (store.fetchPageIndex > 0) {
    referrer = `https://www.lego.com/de-at/pick-and-build/pick-a-brick?perPage=400&page=${(store.fetchPageIndex - 1)}`
  }
  const response = await fetch("https://www.lego.com/api/graphql/PickABrickQuery", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en,de;q=0.9,es;q=0.8,en-US;q=0.7",
    "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InB1YiI6e30sInB2dCI6Im1EdVRHbjVnK1Z5QmRUSXFjYzVMck8vZ3krY1J0ak5sRk1UNDJ2c0tQbEVGSWtpVzRMajlEdDcvY013dXhPb2JoZEdYL2VQVTZoRHprOGRvcUVSMVpKYkpuVG1hVXc2N3FsQWVEb1k4aGhWdUEvaG9nbmI4ZTR2L250M213VEdjSnpnQ0YrWEJ2MUlSWHdFaERDQVhWdnM0bm9yWXFSM1c3S1lDQlp4N0kwcTBwTndTN2kralVzdGdwQUZQNDdiSHBiOXJGNWFTRzZseXhHK2JKYVo2SGhaQkZOcFJXMDBvU3dJSGE5ZUpsSUEwMTV5cWJGUno2bGZabGVMKzJ0SEpONVZWaXZGR0pnUEpoMmh2M0ErcVZXeWRhY1hIallmWG1xM0pzQis5UnVCdlRlTWZlYlMzNHZUcW5rSW92NU5nYnhsdVdyc3ByeDQyS3lwVTFuY3VyNkxVRHdiVmtwZG5qTjViMVF3ZUhDMS9hWlA4eFhja1QvbFF3N0pMbjZtZzdBQ1U4dnZIQjdoOEpoa1pqeU1pOHNtczdDMGxueE01RGY5b0xHRkZVVURMWnhPd1dyVktZaEJFSTZjRnNWbkJDNWNrYWFFb0NDQldDakpmZGZ3cXFhRFBmdWJST2tKeXlTbVB0OTZhd1g4S0FSWld6dWg2SzVaTVpCSVBSMWR2REVnU1FROGJ5dnpCRWhJUlA2RmhBV0FFaFNFbjFpV3paV2JXRXZTYTZld1h6NXFlaE9tUFB4ZU03OEpDdzl0dy45TGlDWm84ZWNDMlRqdjZpWUtmeldRPT0ifSwiaWF0IjoxNzMxNjEzMzU4LCJleHAiOjE3MzE3MTAzMDV9.GB0127Vp1jLB0td_1oqGVbWqz4Zt6UCfdp7FzHuSg4c",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "fff-id": "bd5c1ce7-6264-4eec-a618-4dec41f906bb",
    "lid": "",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "same-origin",
    "sec-fetch-site": "same-origin",
    "session-cookie-id": "kNoxYpurj83OrKAbg8rL_",
    "true-client-ip": "84.115.218.253",
    "visitor-guid": "4e4e1708-febe-4697-8ee4-584ebac7b9d0",
    "x-lego-request-id": "1fc77bfc-f260-4f41-8412-f10203787f31-app-shop-c-b806cc0b",
    "x-locale": "de-AT"
  },
  "referrer": referrer,
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "{\"operationName\":\"PickABrickQuery\",\"variables\":{\"input\":{\"perPage\":400,\"page\":" + store.fetchPageIndex + "}},\"query\":\"query PickABrickQuery($input: ElementQueryInput!, $sku: String) {\\n  searchElements(input: $input) {\\n    results {\\n      ...ElementLeaf\\n      __typename\\n    }\\n    facets {\\n      ...FacetData\\n      __typename\\n    }\\n    set {\\n      id\\n      type\\n      name\\n      imageUrl\\n      instructionsUrl\\n      pieces\\n      inStock\\n      price {\\n        formattedAmount\\n        __typename\\n      }\\n      __typename\\n    }\\n    total\\n    count\\n    __typename\\n  }\\n}\\n\\nfragment FacetData on Facet {\\n  id\\n  key\\n  name\\n  labels {\\n    count\\n    key\\n    name\\n    children {\\n      count\\n      key\\n      name\\n      ... on FacetValue {\\n        value\\n        __typename\\n      }\\n      __typename\\n    }\\n    ... on FacetValue {\\n      value\\n      __typename\\n    }\\n    ... on FacetRange {\\n      from\\n      to\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment ElementLeaf on SearchResultElement {\\n  id\\n  designId\\n  name\\n  imageUrl\\n  maxOrderQuantity\\n  deliveryChannel\\n  price {\\n    centAmount\\n    formattedAmount\\n    currencyCode\\n    __typename\\n  }\\n  quantityInSet(sku: $sku)\\n  facets {\\n    category {\\n      ...ElementFacetCategory\\n      __typename\\n    }\\n    subcategory {\\n      ...ElementFacetCategory\\n      __typename\\n    }\\n    color {\\n      ...ElementFacetCategory\\n      __typename\\n    }\\n    colorFamily {\\n      ...ElementFacetCategory\\n      __typename\\n    }\\n    system\\n    __typename\\n  }\\n  inStock\\n  __typename\\n}\\n\\nfragment ElementFacetCategory on ElementCategory {\\n  name\\n  key\\n  __typename\\n}\"}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});
  store.fetchPageIndex++
  store.lastScraped = new Date()
  if (store.fetchPageIndex >= store.fetchMaxPageIndex) {
    store.fetchPageIndex = 1
  }
  const json = await response.json()
  const searchElements = json?.data?.searchElements
  if (!searchElements) {
    await updateStore(db, store)
    return
  }
  store.fetchMaxPageIndex = Math.ceil(searchElements.total / 400) + 1
  await updateStore(db, store)
  const results = searchElements.results
  for (let i = 0; i < results.length; i++) {
    const legoInvItem = results[i]
    try {
      const color = await getColorByLegoId(db, legoInvItem.facets.color.key)
      if (!color) {
        console.log('no color?!', legoInvItem.facets.color.key)
      }
      const colorId = color?.id || legoInvItem.facets.color.key

      const legoItem: LegoItem | undefined = await getLegoItem(db, legoInvItem.designId)
      if (!legoItem) {
        continue
      }
      const item: Item = legoItem.part
      if (!item) {
        continue
      }
      delete legoItem.part
      legoItem.name = legoInvItem.name
      legoItem.categoryId = legoInvItem.facets.subcategory.key
      const legoCategory: LegoCategory = await getLegoCategory(db, legoItem.categoryId)
      if (!legoCategory) {
        await addLegoCategory(db, legoItem.categoryId, legoInvItem.facets.subcategory.name)
      }
      await addLegoItem(
        colorId,
        legoItem,
        item,
        '//www.lego.com/cdn/product-assets/element.img.photoreal.192x192/' + legoInvItem.id + '.jpg',
        db
      )
      await addInvItem(
        db,
        legoInvItem.id,
        store,
        colorId,
        'New',
        1000000,
        legoInvItem.price.centAmount,
        item.itemId,
      )
    } catch (e) {
      console.log('error adding item', legoInvItem, e)
    }
  }
}

export async function addLegoCategory(
  db: IDBPDatabase,
  legoCategoryId: string,
  legoCategoryName: string
) {
  const categoryId = await addCategory(db)
  const brickLinkCategory: ExternalCategory = {
    categoryId,
    id: legoCategoryId,
    name: legoCategoryName,
    type: "Lego"
  }
  await putExternalCategory(db, brickLinkCategory)
}

// interface LegoPiece {
//   id: number
//   price: number
// }
// async function fetchLegoPiece(itemId: string): Promise<LegoPiece | undefined> {
//   const res = await fetch("https://rebrickable.com/api/v3/lego/parts/?part_nums=" + itemId + "&inc_part_details=1&inc_color_details=0&key=ec4ddb3b958aaa4edf379059e5f87d2e", {
//     "headers": {
//       "accept": "application/json",
//       "accept-language": "en,de;q=0.9,es;q=0.8,en-US;q=0.7",
//       "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
//       "sec-ch-ua-mobile": "?0",
//       "sec-ch-ua-platform": "\"macOS\"",
//       "sec-fetch-dest": "empty",
//       "sec-fetch-mode": "cors",
//       "sec-fetch-site": "same-origin"
//     },
//     "referrer": window.location.href,
//     "referrerPolicy": "strict-origin-when-cross-origin",
//     "body": null,
//     "method": "GET",
//     "mode": "cors",
//     "credentials": "omit"
//   })
//   const json = await res.json()
//   const brickableResponse = json.results
//   const brickableObj = {}
//   brickableResponse.forEach(x => {
//     brickableObj[x.part_num] = x.external_ids?.LEGO
//   })
//   if (!brickableObj[itemId]) {
//     return
//   }
//   const legoId = brickableObj[itemId][0]
//   console.log(legoId)
//   const legoResponse = await fetch("https://www.lego.com/api/graphql/PickABrickQuery", {
//     "headers": {
//       "accept": "*/*",
//       "accept-language": "en,de;q=0.9,es;q=0.8,en-US;q=0.7",
//       "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InB1YiI6e30sInB2dCI6IkFzNzZyWkNsZE9WSnNtcEorMTcxNUlOa3VKMnBsVWlpWm1IaEF5azNMazRyMjlkcEFqVytmck9jakgvc21ldnZEU05IZ0c5Q0hBc1M2TllzZk1XZjJ0cTRTZnM3dmpqMUhtcHBrWjVvV0RKS0p6OTJObG9VTGdHbzUwYzMvZ01ZdWwxSUJpb3Q4RW9SbEtlUml4bVlhVVlCRncyMmo5ZWRkc3oyUGFQVUVTMFFmQWo1TzlFSERYRDI2TldpZkk0Si93cUdKYndmcFVZano1SlFwZy9SQ1AyV3ZSZkdYUFVkOXN3ajRiUForTW1MUzlvUkw1MG85bXd6eUtrdnllVUJpbDJBL052TVFwVDczVUpCRjlmaGJaSTZUN05aMUFFQURxZFhVVjVIS1hnYkpUNmtGMzlsZHdZZktlNnluR2ZjRzY5c2lvdjdDZ2pNZjdUK1BnUzVlSVhSMkpSWWJQRnZYMG9rakJBeEtnV0JRVW91dlozRmtCN2RnZFpHRkk0dFh3U2NZRnJZUE4vVENvRGZLb1lwaWFURkFzY2dTNkNyRm1GN00yTjIxVlIwSmlPTjV4R1RUV2hSMHBheEh0b0x1WXBoUmRnRXpvK3U0a0hNN3M2Uis1bEF0MUd5TGpYNUZDbFRKZm9VMGtDODVKd2RiZm41ZkFQalhDVzBNU0pYK1J6eUkyK3IxWVRNdU9nTkFOWXNMQ21qdUlISE9Vbjh2OTFlVDZrT2N3S28rQzhFOUtqYmRoYUdKRkgyRmhYZS4rU3o4aFBqQ0JyTG1LU2F4UElLK05nPT0ifSwiaWF0IjoxNzMxNTM4MjYyLCJleHAiOjE3MzE3MTAzMDV9.uAbQC0sA1TYS1OxsZCDUJa9MfAAnUWP4hYZxnPxHKEc",
//       "cache-control": "no-cache",
//       "content-type": "application/json",
//       "fff-id": "bd5c1ce7-6264-4eec-a618-4dec41f906bb",
//       "lid": "",
//       "pragma": "no-cache",
//       "priority": "u=1, i",
//       "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
//       "sec-ch-ua-mobile": "?0",
//       "sec-ch-ua-platform": "\"macOS\"",
//       "sec-fetch-dest": "empty",
//       "sec-fetch-mode": "same-origin",
//       "sec-fetch-site": "same-origin",
//       "session-cookie-id": "kNoxYpurj83OrKAbg8rL_",
//       "true-client-ip": "84.115.218.253",
//       "visitor-guid": "4e4e1708-febe-4697-8ee4-584ebac7b9d0",
//       "x-lego-request-id": "c50ab392-19c3-4fe0-ab04-c96e1341930e-app-shop-c-bcd7be8a",
//       "x-locale": "de-AT"
//     },
//     "referrer": "https://www.lego.com/de-at/pick-and-build/pick-a-brick?query=4490",
//     "referrerPolicy": "strict-origin-when-cross-origin",
//     "body": "{\"operationName\":\"PickABrickQuery\",\"variables\":{\"input\":{\"perPage\":100,\"query\":\"" + brickableObj[itemId][0] + "\"}},\"query\":\"query PickABrickQuery($input: ElementQueryInput!, $sku: String) {\\n  searchElements(input: $input) {\\n    results {\\n      ...ElementLeaf\\n      __typename\\n    }\\n    facets {\\n      ...FacetData\\n      __typename\\n    }\\n    set {\\n      id\\n      type\\n      name\\n      imageUrl\\n      instructionsUrl\\n      pieces\\n      inStock\\n      price {\\n        formattedAmount\\n        __typename\\n      }\\n      __typename\\n    }\\n    total\\n    count\\n    __typename\\n  }\\n}\\n\\nfragment FacetData on Facet {\\n  id\\n  key\\n  name\\n  labels {\\n    count\\n    key\\n    name\\n    children {\\n      count\\n      key\\n      name\\n      ... on FacetValue {\\n        value\\n        __typename\\n      }\\n      __typename\\n    }\\n    ... on FacetValue {\\n      value\\n      __typename\\n    }\\n    ... on FacetRange {\\n      from\\n      to\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment ElementLeaf on SearchResultElement {\\n  id\\n  designId\\n  name\\n  imageUrl\\n  maxOrderQuantity\\n  deliveryChannel\\n  price {\\n    centAmount\\n    formattedAmount\\n    currencyCode\\n    __typename\\n  }\\n  quantityInSet(sku: $sku)\\n  facets {\\n    category {\\n      ...ElementFacetCategory\\n      __typename\\n    }\\n    subcategory {\\n      ...ElementFacetCategory\\n      __typename\\n    }\\n    color {\\n      ...ElementFacetCategory\\n      __typename\\n    }\\n    colorFamily {\\n      ...ElementFacetCategory\\n      __typename\\n    }\\n    system\\n    __typename\\n  }\\n  inStock\\n  __typename\\n}\\n\\nfragment ElementFacetCategory on ElementCategory {\\n  name\\n  key\\n  __typename\\n}\"}",
//     "method": "POST",
//     "mode": "cors",
//     "credentials": "include"
//   })
//   const legoJson = await legoResponse.json()
//   const results = legoJson.data.searchElements.results
//   const legoPart = results.find(part => part.designId === itemId)
//   if (!legoPart) {
//     return
//   }
//   return {
//     id: legoId,
//     price: legoPart.price.centAmount
//   }
// }

