import { DBDriver } from '../driver/abstract'
import { addListener, debugLog, delProperty, dispatch, expire, Keys, reactCache, setProperty, verifyEntry } from '../shared'

export function entries<T = unknown>(
    cache: reactCache,
    driver: DBDriver,
    id: string,
    rerender: () => void,
    expire?: expire,
): Array<[string, T]> {
    addListener(cache, [Keys], id, rerender)

    // addListener creates the entry if it does not exists
    const keysEntry = cache[Keys] as NonNullable<reactCache[typeof Keys]>

    const isFetchingOrValid = keysEntry.promise || verifyEntry(keysEntry, expire)
    if (!isFetchingOrValid) {
        debugLog('Get entries from idb')

        const idbPromise: Promise<[string, unknown][]> = driver.entries().then(
            (entries) => {
                debugLog('  -> received entries from idb: %d', entries.length)

                const dbKeys = new Set()
                for (const [key, entry] of entries) {
                    /* istanbul ignore next */
                    if (typeof key !== 'string') {
                        continue
                    }

                    dbKeys.add(key)
                    setProperty(cache, [key, 'obj'], entry)
                    delProperty(cache, [key, 'isVolatile'])
                }

                for (const [key, entry] of Object.entries(cache)) {
                    if (!entry.isVolatile && !dbKeys.has(key)) {
                        delProperty(cache, [key, 'obj'])
                    }
                }

                keysEntry.obj = {data: null, meta: {date: new Date()}}
                delete keysEntry.promise
                dispatch(cache, [Keys])

                return getDataEntries(cache)
            },
        )

        keysEntry.promise = idbPromise
    }

    return getDataEntries(cache) as Array<[string, T]>
}

function getDataEntries(
    cache: reactCache,
) {
    const entries: [string, unknown][] = []

    for (const [key, entry] of Object.entries(cache)) {
        if (entry.obj) {
            entries.push([key, entry.obj.data])
        }
    }

    return entries
}
