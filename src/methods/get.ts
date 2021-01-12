import { get as idbGet } from 'idb-keyval'
import { debugLog, expire, reactCache, verifyEntry } from '../shared'
import { cachedObj } from '../useCached'

export function get(
    cache: reactCache,
    store: Parameters<typeof idbGet>[1],
    rerender: () => void,
    key: string,
    loader: () => Promise<void>,
    expire: expire | undefined,
): unknown {
    if (!verifyEntry(cache[key], expire)) {
        debugLog('Get from idb: %s', key)

        cache[key].promise = idbGet(key, store).then(
            obj => {
                debugLog.enabled && debugLog('  -> received "%s" from idb: %s', key, JSON.stringify(obj))

                if (verifyEntry({ obj }, expire)) {
                    cache[key] = { obj }
                    rerender()
                } else if (typeof (loader) === 'function') {
                    return cache[key].promise = loader()
                        .then(rerender)
                        .finally(() => { delete cache[key].promise })
                        .then(() => cache[key].obj)
                } else {
                    delete cache[key]
                }
            },
            reason => {
                debugLog('Failed to get "%s" from idb: %s', key, reason)
                delete cache[key].promise
            },
        ).then(r => (r as cachedObj | undefined) ?? cache[key].obj)
    }

    return cache[key]?.obj?.data
}
