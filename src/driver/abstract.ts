/* eslint-disable @typescript-eslint/no-explicit-any */

import { cachedObj } from '../shared'

export type DBKey = IDBValidKey
export type DBValue<T> = cachedObj<T> | undefined

/**
 * @internal
 */
export interface DBDriverFactory {
    (dbName: string, storeName: string): DBDriver
}

/**
 * Driver for local/device/session cache.
 *
 * @internal
 */
export interface DBDriver {
    clear(): Promise<void>
    del(key: DBKey): Promise<void>
    entries<T = any>(): Promise<[DBKey, NonNullable<DBValue<T>>][]>
    getMany<T = any>(keys: DBKey[]): Promise<DBValue<T>[]>
    setMany<T = any>(entries: [DBKey, DBValue<T>][]): Promise<void>
}
