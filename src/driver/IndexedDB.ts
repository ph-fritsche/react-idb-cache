import { openDB, IDBPDatabase } from 'idb'
import { DBDriver, DBKey } from './abstract'

export default function (
    dbName: string,
    storeName: string,
): DBDriver {
    return new IndexedDB(() => getDBWithStore(dbName, storeName), storeName)
}

const dbs: Record<string, Promise<IDBPDatabase>> = {}

export async function resetConnections(): Promise<void> {
    for(const [name, db] of Object.entries(dbs)) {
        (await db).close()
        delete dbs[name]
    }
}

export async function getDBWithStore(
    dbName: string,
    storeName: string,
): Promise<IDBPDatabase> {
    const db = await (dbs[dbName] ?? open(dbName, storeName))

    if (!db.objectStoreNames.contains(storeName)) {
        return open(dbName, storeName, db.version + 1)
    }

    return db
}

async function open(dbName: string, storeName: string, version: number | undefined = undefined) {
    if (dbName in dbs) {
        (await dbs[dbName]).close()
    }
    return dbs[dbName] = openDB(dbName, version, {
        upgrade(db) {
            db.createObjectStore(storeName)
        },
    })
}

export class IndexedDB {
    private getDB: () => Promise<IDBPDatabase>
    private storeName: string
    constructor(getDB: () => Promise<IDBPDatabase>, storeName: string) {
        this.getDB = getDB
        this.storeName = storeName
    }

    async clear(): Promise<void> {
        return (await this.getDB()).clear(this.storeName)
    }

    async del(key: DBKey): Promise<void> {
        return (await this.getDB()).delete(this.storeName, key)
    }

    async entries<T>(): Promise<Array<[IDBValidKey, T]>> {
        const items: Array<[IDBValidKey, T]> = []
        const transaction = (await this.getDB()).transaction(this.storeName, 'readonly')

        let cursor = await transaction.store.openCursor()
        while(cursor) {
            items.push([cursor.key, cursor.value])
            cursor = await cursor.continue()
        }

        await transaction.done
        return items
    }

    async getMany<T>(keys: DBKey[]): Promise<Array<T>> {
        const transaction = (await this.getDB()).transaction(this.storeName, 'readonly')

        const r = await Promise.all(keys.map(k => transaction.store.get(k)))

        await transaction.done
        return r
    }

    async setMany(entries: [DBKey, unknown][]): Promise<void> {
        const transaction = (await this.getDB()).transaction(this.storeName, 'readwrite')

        await Promise.all<unknown>(entries.map(([key, value]) => (
            value !== undefined
                ? transaction.store.put(value, key)
                : transaction.store.delete(key)
        )))

        transaction.commit()
        return transaction.done
    }
}
