import { IDBPDatabase } from 'idb'
import INDICES from './indices'
import { ActiveSearchPageCondition, ConditionsPageCondition } from '../types'
import { countFromIndex } from './db'
import { getDbConnection } from './idb'

export async function getCondition(
  db: IDBPDatabase,
  id: string
): Promise<ActiveSearchPageCondition> {
  const numInvItems = await countFromIndex(
    db,
    INDICES.INV_ITEMS_BY_CONDITION,
    id
  )
  return {
    id,
    numInvItems,
  }
}
export async function excludeCondition(condition: string) {}

export async function getConditionsPageConditions(): Promise<
  ConditionsPageCondition[]
> {
  const conditions = ['New', 'Used']
  const cpConditions = []
  const db = await getDbConnection()
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i]
    const numInvItems = await countFromIndex(
      db,
      INDICES.INV_ITEMS_BY_CONDITION,
      condition
    )
    cpConditions.push({
      id: condition,
      numInvItems,
    })
  }
  return cpConditions
}
