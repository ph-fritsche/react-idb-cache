import { clear, createStore, del, entries, getMany, setMany } from 'idb-keyval';
import { DBDriver, DBKey, DBValue } from './abstract';

export default (dbName: string, storeName: string): IndexedDBDriver => new IndexedDBDriver(dbName, storeName)

class IndexedDBDriver implements DBDriver {
    constructor(dbName: string, storeName: string) {
        this.store = createStore(dbName, storeName)
    }
    store: ReturnType<typeof createStore>

    clear(): Promise<void> {
        return clear(this.store)
    }

    del(key: DBKey): Promise<void> {
        return del(key, this.store)
    }

    entries<T extends unknown>(): Promise<[DBKey, NonNullable<DBValue<T>>][]> {
        return entries(this.store)
    }

    getMany<T extends unknown>(keys: DBKey[]): Promise<DBValue<T>[]> {
        return getMany(keys, this.store)
    }

    setMany<T extends unknown>(entries: [DBKey, DBValue<T>][]): Promise<void> {
        return setMany(entries, this.store)
    }
}
