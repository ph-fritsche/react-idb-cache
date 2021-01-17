import { useMemo, useRef, useState } from 'react'
import { createStore } from 'idb-keyval'
import { reactCache } from './shared'
import { createApi } from './methods'

export function useCached({dbName = 'Cached', storeName = 'keyval'}: {
    dbName?: string,
    storeName?: string,
} = {}): ReturnType<typeof createApi> {
    const store = useRef(createStore(dbName, storeName)).current

    const cache = useRef<reactCache>({}).current
    const [, setState] = useState({})

    const mounted = useRef(false)
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
