import { put, dbDelete } from '@/options/idb/db'
import { liveObjectCache } from '@/options/idb/idb'
import { getActiveSearch } from '@/options/idb/searches'
import stores from '@/options/idb/stores'
import { ExternalCategory, SearchFilter } from '@/options/types'

export function useFilterCategory() {
  async function exclude(externalCategory: ExternalCategory) {
    return await filterCategory(externalCategory, true)
  }
  async function include(externalCategory: ExternalCategory) {
    return await filterCategory(externalCategory, false)
  }
  async function filterCategory(
    externalCategory: ExternalCategory,
    isExcluded: boolean
  ) {
    const search = await getActiveSearch()
    if (!search) {
      return
    }
    const filter: SearchFilter = {
      searchId: search.id,
      type: 'externalCategory',
      isExcluded,
      objectId: externalCategory.id,
    }
    put(liveObjectCache.db, stores.SEARCH_FILTERS, filter)
    externalCategory.excluded = isExcluded
    externalCategory.included = !isExcluded
  }
  async function clear(category: ExternalCategory) {
    const search = await getActiveSearch()
    if (!search) {
      return
    }
    dbDelete(liveObjectCache.db, stores.SEARCH_FILTERS, [
      search.id,
      'externalCategory',
      category.id,
    ])
    category.excluded = false
    category.included = false
  }
  return {
    include,
    exclude,
    clear,
  }
}
