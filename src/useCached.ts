import { useMemo, useRef, useState } from 'react'
import { createStore } from 'idb-keyval'
import { expire, reactCache } from './shared'
import { clear, del, get, set } from './methods'

export interface useCachedApi {
    get: (key: string, loader: () => Promise<void>, expire: expire) => unknown,
    set: (key: string, data: cachedObj['data'], meta?: cachedObj['meta']) => void,
    del: (key: string) => void,
    clear: (expire: expire) => void,
}

export interface cachedObj {
    data: unknown,
    meta: {
        date?: Date | string,
    },
}

export function useCached({dbName = 'Cached', storeName = 'keyval'}: {
    dbName?: string,
    storeName?: string,
} = {}): useCachedApi {
    const store = useRef(createStore(dbName, storeName)).current

    const cache = useRef<reactCache>({}).current
    const [, setState] = useState({})

    const api = useMemo(() => ({
        get: get.bind(undefined, cache, store, () => setState({})),
        set: set.bind(undefined, cache, store),
        del: del.bind(undefined, cache, store),
        clear: clear.bind(undefined, cache, store),
    }), [cache, store, setState])

    return api
}
