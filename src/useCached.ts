import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createStore } from 'idb-keyval'
import { reactCache } from './shared'
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

    const [, setState] = useState({})

    const mounted = useRef(true)
    useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false}
    })

    const api = useMemo(() => createApi(cache, store,
        () => {
            if (mounted.current) {
                setState({})
            }
        },
    ), [cache, store, setState])

    return api
}
