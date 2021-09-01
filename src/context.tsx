import React, { useMemo, useRef } from 'react'
import { reactCache } from './shared'
import { DBDriverFactory } from './driver/abstract'
import { lazyDBDriver } from './driver/lazy'

/**
 * @internal
 */
type CacheContext = {
    cache: {
        [dbName: string]: {
            [storeName: string]: reactCache,
        },
    },
    dbDriverFactory: DBDriverFactory,
}

const lazyIndexedDB = lazyDBDriver(() => import('./driver/IndexedDB'))

export const globalContext: CacheContext = {
    cache: {},
    dbDriverFactory: lazyIndexedDB,
}

export const CacheContext = React.createContext<CacheContext>(globalContext)

/**
 * Configure the cache used outside of CacheProvider.
 * Be aware that changing the global config does not rerender any components.
 */
export function configureGlobalCache(
    {
        dbDriverFactory,
    }: {
        dbDriverFactory: DBDriverFactory,
    },
): void {
    globalContext.dbDriverFactory = dbDriverFactory
}

export function CacheProvider(
    {
        dbDriverFactory = lazyIndexedDB,
        children,
    }: React.PropsWithChildren<{
        dbDriverFactory?: DBDriverFactory
    }>,
): React.ReactElement {
    const cache = useRef<CacheContext['cache']>({}).current
    const context: CacheContext = useMemo(() => ({cache, dbDriverFactory}), [cache, dbDriverFactory])

    return <CacheContext.Provider value={context}>{children}</CacheContext.Provider>
}
