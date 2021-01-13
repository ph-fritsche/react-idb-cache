import { getMany } from 'idb-keyval'
import { debugLog, expire, reactCache, verifyEntry } from '../shared'

export function get<T extends string, U = {[K in T]: unknown}>(
    cache: reactCache,
    store: Parameters<typeof getMany>[1],
    rerender: () => void,
    keyArray: T[],
    loader?: (missingKeys: string[]) => Promise<void>,
    expire?: expire,
): U;
export function get(
    cache: reactCache,
    store: Parameters<typeof getMany>[1],
    rerender: () => void,
    key: string,
    loader?: () => Promise<void>,
    expire?: expire,
): unknown;
export function get(
    cache: reactCache,
    store: Parameters<typeof getMany>[1],
    rerender: () => void,
    keyOrKeys: string | string[],
    loader?: (missingKeys: string[]) => Promise<void>,
    expire?: expire,
): unknown | Record<string, unknown> {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]

    const data: Record<string, unknown> = {}
    const missing: string[] = []

    keys.forEach(key => {
        if(!verifyEntry(cache[key], expire)) {
            missing.push(key)
        }
        data[key] = cache[key]?.obj?.data
    })

    if (missing.length) {
        debugLog('Get from idb: %s', missing.join(', '))

        const idbPromise = getMany(missing, store).then(
            obj => {
                debugLog.enabled && debugLog(
                    '  -> received from idb:\n%s',
                    missing.map((k, i) => `\t${k}: ${JSON.stringify(obj[i])}`).join('\n'),
                )

                const stillMissing: string[] = []
                obj.forEach((obj, i) => {
                    if (verifyEntry({ obj }, expire)) {
                        cache[ missing[i] ] = { obj }
                    } else {
                        stillMissing.push(missing[i])
                    }
                })

                const loaderPromise = typeof loader === 'function' ? loader(stillMissing) : undefined

                if (loaderPromise) {
                    stillMissing.forEach(key => {
                        cache[key] = cache[key] ?? {}
                        cache[key].promise = loaderPromise.then(() => cache[key].obj)
                        loaderPromise.finally(() => { delete cache[key].promise })
                    })

                    return missing.map(key => stillMissing.includes(key) ? cache[key].promise : cache[key].obj)
                } else {
                    stillMissing.forEach(key => { delete cache[key].promise })
                    return missing.map(key => cache[key]?.obj)
                }
            },
        )

        idbPromise.then(rerender)

        missing.forEach((key, i) => {
            cache[key] = cache[key] ?? {}
            cache[key].promise = idbPromise.then(values => values[i])
        })
    }

    return Array.isArray(keyOrKeys) ? data : data[keys[0]]
}
