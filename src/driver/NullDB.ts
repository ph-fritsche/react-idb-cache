import { DBDriver, DBKey, DBValue } from './abstract';

export default (): typeof NullDBDriver => NullDBDriver

const NullDBDriver: DBDriver = {
    async clear(): Promise<void> {
        return
    },
    async del(): Promise<void> {
        return
    },
    async entries<T extends unknown>(): Promise<[DBKey, NonNullable<DBValue<T>>][]> {
        return []
    },
    async getMany<T extends unknown>(keys: DBKey[]): Promise<DBValue<T>[]> {
        return keys.map(() => undefined)
    },
    async setMany(): Promise<void> {
        return
    },
}
