import { IDBPDatabase } from "idb";
import INDICES from './indices'
import { ActiveSearchButtonActiveSearch, ActiveSearchPageCondition, ConditionsPageCondition, UiCategory, UiSearch, UiShopList, UiStore } from "../types";
import { countFromIndex, getActiveSearch, getDbConnection } from "./idb";

export const openCategory = ref<UiCategory | null>(null)
export const openSearch = ref<UiSearch | null>(null)
export const openStore = ref<UiStore | null>(null)

export async function getCondition(db: IDBPDatabase, id: string): Promise<ActiveSearchPageCondition> {
  const numInvItems = await countFromIndex(db, INDICES.INV_ITEMS_BY_CONDITION, id)
  return {
    id,
    numInvItems
  }
}
export async function excludeCondition(condition: string) {
  const activeSearch: ActiveSearchButtonActiveSearch = getActiveSearch()
  if (!activeSearch.conditions) {
    activeSearch.conditions = {
      ids: [],
      excluded: false
    }
  }
  activeSearch.conditions.excluded = true
  activeSearch.conditions.ids.push(condition)
  storeActiveSearch(activeSearch)
}

export async function getConditionsPageConditions(): Promise<ConditionsPageCondition[]> {
  const conditions = ['New', 'Used']
  const cpConditions = []
  const db = await getDbConnection()
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i]
    const numInvItems = await countFromIndex(db, INDICES.INV_ITEMS_BY_CONDITION, condition)
    cpConditions.push({
      id: condition,
      numInvItems
    })
  }
  return cpConditions
}