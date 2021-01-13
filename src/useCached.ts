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

    const api = useMemo(() => createApi(cache, store, () => setState({})), [cache, store, setState])

    return api
}
