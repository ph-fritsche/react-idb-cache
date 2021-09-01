import { DBDriver, DBDriverFactory, DBKey, DBValue } from './abstract'

export function lazyDBDriver(loader: () => Promise<DBDriverFactory|{default: DBDriverFactory}>): DBDriverFactory {
    return (dbName, storeName) => new LazyDB(loader, dbName, storeName)
}

class LazyDB implements DBDriver {
    constructor(
        loader: () => Promise<DBDriverFactory|{default: DBDriverFactory}>,
        dbName: string,
        storeName: string,
    ) {
        this.loader = loader
        this.dbName = dbName
        this.storeName = storeName
    }
    private loader: () => Promise<DBDriverFactory|{default: DBDriverFactory}>
    private driver?: DBDriver
    private dbName: string
    private storeName: string

    private async loadDriver() {
        return this.driver ?? this.loader().then(m => {
            const factory = typeof m === 'function' ? m : m.default
            return this.driver = factory(this.dbName, this.storeName)
        })
    }

    async clear(): Promise<void> {
        return this.loadDriver().then(d => d.clear())
    }
    async del(key: DBKey): Promise<void> {
        return this.loadDriver().then(d => d.del(key))
    }
    async entries<T extends unknown>(): Promise<[DBKey, NonNullable<DBValue<T>>][]> {
        return this.loadDriver().then(d => d.entries())
    }
    async getMany<T extends unknown>(keys: DBKey[]): Promise<DBValue<T>[]> {
        return this.loadDriver().then(d => d.getMany(keys))
    }
    async setMany<T extends unknown>(entries: [DBKey, DBValue<T>][]): Promise<void> {
        return this.loadDriver().then(d => d.setMany(entries))
    }
}
