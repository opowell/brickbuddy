import { put, dbDelete } from '@/options/idb/db'
import { liveObjectCache } from '@/options/idb/idb'
import { SearchFilter, Store } from '@/options/types'
import STORES from '@/options/idb/stores'

export function useFilterStore(
  includedMap: Map<string, boolean>,
  excludedMap: Map<string, boolean>
) {
  async function include(store: Store) {
    return await filter(store, false)
  }
  async function exclude(store: Store) {
    return await filter(store, true)
  }
  async function filter(store: Store, isExcluded: boolean) {
    const search = await liveObjectCache.getActiveSearch()
    const filter: SearchFilter = {
      searchId: search.id,
      type: 'store',
      isExcluded,
      objectId: store.id,
    }
    includedMap.set(store.id, !isExcluded)
    excludedMap.set(store.id, isExcluded)
    await put(liveObjectCache.db, STORES.SEARCH_FILTERS, filter)
  }
  async function clear(store: Store) {
    const search = await liveObjectCache.getActiveSearch()
    dbDelete(liveObjectCache.db, STORES.SEARCH_FILTERS, [
      search.id,
      'store',
      store.id,
    ])
    includedMap.delete(store.id)
    excludedMap.delete(store.id)
  }
  return {
    include,
    exclude,
    filter,
    clear,
  }
}
