import { IDBPDatabase } from 'idb'
import { SearchFilter, StoreCountriesPageStoreCountry } from '../types'
import { countFromIndex, getFromIndex, put } from './db'
import { getDbConnection, liveObjectCache } from './idb'
import indices from './indices'
import stores from './stores'
import { getActiveSearch } from './searches'
import ObjectCache from './ObjectCacheClass'

export async function getStoreCountriesPageStoreCountries(): Promise<
  StoreCountriesPageStoreCountry[] | undefined
> {
  const db = await getDbConnection()
  const cache = new ObjectCache(db)
  const countries = await cache.getStoreCountries()
  if (!countries) {
    return
  }
  const storeCountries = []
  for (let i = 0; i < countries.length; i++) {
    const country = countries[i]
    const numStores = await countFromIndex(
      cache.db,
      indices.STORES_BY_COUNTRY,
      country.id
    )
    const search = await getActiveSearch()
    const filter = await getFromIndex<SearchFilter>(
      cache.db,
      indices.SEARCH_FILTERS_BY_SEARCH_TYPE_OBJECT,
      [search.id, 'storeCountry', country.id]
    )
    const excluded = filter ? filter.isExcluded : false
    const included = filter ? !filter.isExcluded : false
    storeCountries.push({
      ...country,
      excluded,
      included,
      numStores,
    })
  }
  return storeCountries
}

export async function addStoreCountry(
  db: IDBPDatabase,
  id: string,
  name: string
): Promise<IDBValidKey | undefined> {
  return await put(db, stores.STORE_COUNTRIES, { id, name })
}
