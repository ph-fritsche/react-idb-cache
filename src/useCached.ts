import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createStore } from 'idb-keyval'
import { addListener, reactCache, removeListener } from './shared'
import { createApi } from './methods'
import { CacheContext } from './context'

export function useCached({dbName = 'Cached', storeName = 'keyval', context = true}: {
    dbName?: string,
    storeName?: string,
    context?: boolean,
} = {}): ReturnType<typeof createApi> {
    const store = useRef(createStore(dbName, storeName)).current

    const componentCache = useRef<reactCache>({}).current
    const contextCache = useContext(CacheContext)

    if (context) {
        if (!contextCache[dbName]) {
            contextCache[dbName] = {}
        }
        if (!contextCache[dbName][storeName]) {
            contextCache[dbName][storeName] = {}
        }
    }
    const cache = context ? contextCache[dbName][storeName] : componentCache

    const subscribedKeys = useRef<string[]>([])
    const id = useRef(Math.random().toString(36)).current
    const [, _setState] = useState({})
    const rerender = useCallback(() => _setState({}), [_setState])

    useEffect(() => {
        addListener(cache, subscribedKeys.current, id, rerender)
        return () => {
            subscribedKeys.current = removeListener(cache, id)
        }
    })

    const api = useMemo(() => createApi(cache, store, id, rerender), [cache, store, id, rerender])

    return api
}
