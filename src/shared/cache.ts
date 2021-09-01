export interface reactCacheEntry<T extends unknown = unknown> {
    promise?: Promise<cachedObj<T> | undefined>
    obj?: cachedObj<T>
    listeners?: Record<string | symbol, () => void>
    /** only set in react cache - not received from or written to db */
    isVolatile?: boolean
}

export const Keys = Symbol('keys')
export type Keys = Set<string>

export type reactCache = Record<string, reactCacheEntry> & {
    [Keys]?: {
        promise?: Promise<[string, unknown][]>
        obj?: cachedObj<null>
        listeners?: Record<string | symbol, () => void>
    }
}

export type expire = number | ((obj: cachedObj) => boolean)

export type cachedObj<T extends unknown = unknown> = {
    data: T
    meta: {
        date?: Date | string
        [k: string]: unknown
    }
}
