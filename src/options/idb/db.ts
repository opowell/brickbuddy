import { IDBPDatabase, IDBPTransaction } from "idb";
import { StoreDefinition } from "./stores";
import { IndexDefinition } from "./indices";

export async function getAll(db: IDBPDatabase, storeDefinition: StoreDefinition) {
  return db.getAll(storeDefinition.name)
}

export async function count(db: IDBPDatabase, storeDefinition: StoreDefinition) {
  return await db.count(storeDefinition.name)
}
export async function getAllKeys(db: IDBPDatabase, storeDefinition: StoreDefinition) {
  return await db.getAllKeys(storeDefinition.name)
}

export async function getFromIndex(
  db: IDBPDatabase,
  index: IndexDefinition,
  query: IDBKeyRange | IDBValidKey
): Promise<any> {
  return await db.getFromIndex(index.store, index.name, query)
}
export async function get(db: IDBPDatabase, store: StoreDefinition, query: IDBKeyRange | IDBValidKey) {
  return await db.get(store.name, query)
}
export async function countFromIndex(db: IDBPDatabase, index: IndexDefinition, query?: string | (string | number)[] | number) {
  return await db.countFromIndex(index.store, index.name, query)
}
export async function put(db: IDBPDatabase, storeDef: StoreDefinition, value: any) {
  try {
    return await db.put(storeDef.name, value)
  } catch (e) {
    console.log(value, e)
  }
}

export async function getAllFromIndex(db: IDBPDatabase, index: IndexDefinition, query?: IDBKeyRange | IDBValidKey | null | undefined, count?: number) {
  return db.getAllFromIndex(index.store, index.name, query, count)
}

export function createIndex(transaction: IDBPTransaction<unknown, string[], "versionchange">, index: IndexDefinition) {
  const store = transaction.objectStore(index.store)
  store.createIndex(index.name, index.keyPath)
}
export function createStore(db: IDBPDatabase, storeDefinition: StoreDefinition) {
  db.createObjectStore(storeDefinition.name, {
    keyPath: storeDefinition.keyPath,
    autoIncrement: storeDefinition.autoIncrement === true
  })
}
