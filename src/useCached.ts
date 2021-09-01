import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { addListener, reactCache, removeListener } from './shared'
import { createApi } from './methods'
import { CacheContext } from './context'

export function useCached({dbName = 'Cached', storeName = 'keyval', context = true}: {
    dbName?: string,
    storeName?: string,
    context?: boolean,
} = {}): ReturnType<typeof createApi> {
    const { cache: contextCache, dbDriverFactory } = useContext(CacheContext)
    const componentCache = useRef<reactCache>({}).current

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

    const api = useMemo(
        () => createApi(cache, dbDriverFactory(dbName, storeName), id, rerender),
        [cache, dbDriverFactory, dbName, storeName, id, rerender],
    )

    return api
}
