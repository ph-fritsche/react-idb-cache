import React, { useRef } from 'react'
import { reactCache } from './shared'

type globalCache = {
    [dbName: string]: {
        [storeName: string]: reactCache,
    },
}

export const CacheContext = React.createContext<globalCache>({})

export function CacheProvider(
    {children}: React.PropsWithChildren<unknown>,
): React.ReactElement {
    const cache = useRef<globalCache>({}).current
    return React.createElement(CacheContext.Provider, {value: cache}, children)
}
