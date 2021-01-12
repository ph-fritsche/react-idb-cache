import { useMemo, useRef, useState } from 'react'
import { clear, del, get, keys, set, createStore } from 'idb-keyval'
import debugLib from 'debug'

const debugLog = debugLib('react-idb-cached')

interface useCachedApi {
    get: (key: string, loader: () => Promise<void>, expire: expire) => unknown,
    set: (key: string, data: cachedObj['data'], meta?: cachedObj['meta']) => void,
    del: (key: string) => void,
    clear: (expire: expire) => void,
}

interface cachedObj {
    data: unknown,
    meta: {
        date?: Date | string,
    },
}

type expire = number | ((obj: cachedObj) => boolean)

interface reactCacheEntry {
    promise?: Promise<cachedObj | undefined>,
    obj?: cachedObj,
}

type reactCache = Record<string, reactCacheEntry>

export function useCached({dbName = 'Cached', storeName = 'keyval'}: {
    dbName?: string,
    storeName?: string,
} = {}): useCachedApi {
    const store = useRef(createStore(dbName, storeName)).current

    const cache = useRef({}).current
    const [, setState] = useState({})

    const api = useMemo(() => ({
        get: getFromCache.bind(undefined, cache, store, () => setState({})),
        set: setToCache.bind(undefined, cache, store),
        del: delFromCache.bind(undefined, cache, store),
        clear: clearCache.bind(undefined, cache, store),
    }), [cache, store, setState])

    return api
}

function verifyEntry(entry: reactCacheEntry | undefined, expire: expire | undefined) {
    if (entry?.promise instanceof Promise) {
        return true
    } else if (!entry?.obj) {
        return false
    }

    if (typeof (expire) === 'function') {
        return !expire(entry.obj)
    } else if (typeof (expire) === 'number' && entry.obj.meta?.date) {
        const d = typeof (entry.obj.meta?.date) === 'string' ? new Date(entry.obj.meta.date) : entry.obj.meta.date
        if (d.getTime() < (new Date()).getTime() - expire) {
            return false
        }
    }

    return true
}

function getFromCache(
    cache: reactCache,
    store: Parameters<typeof get>[1],
    rerender: () => void,
    key: string,
    loader: () => Promise<void>,
    expire: expire | undefined,
): unknown {
    if (!verifyEntry(cache[key], expire)) {
        debugLog('Get from idb: %s', key)

        cache[key].promise = get(key, store).then(
            obj => {
                debugLog.enabled && debugLog('  -> received "%s" from idb: %s', key, JSON.stringify(obj))

                if (verifyEntry({obj}, expire)) {
                    cache[key] = {obj}
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

function setToCache(
    cache: reactCache,
    store: Parameters<typeof get>[1],
    key: string,
    data: cachedObj['data'],
    meta?: cachedObj['meta'],
): void {
    cache[key].obj = {
        data,
        meta: {
            date: new Date(),
            ...meta,
        },
    }
    set(key, { data, meta }, store)
}

function delFromCache(
    cache: reactCache,
    store: Parameters<typeof get>[1],
    key: string,
): void {
    delete cache[key]
    del(key, store)
}

function clearCache(
    cache: reactCache,
    store: Parameters<typeof get>[1],
    expire: expire,
): void {
    if (expire !== undefined) {
        keys(store).then(
            keys => Promise.all<IDBValidKey | undefined>(
                keys.map(k => get(k, store)
                    .then(obj => {
                        if (!verifyEntry({obj}, expire)) {
                            del(k, store)
                            return k
                        }
                        return undefined
                    }),
                ),
            ),
        ).then(
            keys => keys.forEach(k => {
                if (k) {
                    delete cache[String(k)]
                }
            }),
        )
    } else {
        clear().then(() => Object.keys(cache).forEach(k => delete cache[k]))
    }
}
